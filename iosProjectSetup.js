// This file is executed in the 'Apptile Setup' build phases step in the ios project.
const xcode = require('xcode');
const plist = require('plist');
const path = require('path');
const axios = require('axios');
const {readFile, writeFile} = require('node:fs/promises');
const {createWriteStream} = require('fs');

async function main() {
  try {
    // Get location of ios folder in project
    const iosFolderLocation = path.resolve(__dirname, 'ios');

    // Read apptile.config.json
    console.log("Pulling in configurations from apptile.config.json to Info.plist");
    const apptileConfigRaw = await readFile(
      path.resolve(iosFolderLocation, '../apptile.config.json'), 
      {encoding: 'utf8'}
    );
    const apptileConfig = JSON.parse(apptileConfigRaw);

    // Add Info.plist updates
    const infoPlistLocation = path.resolve(iosFolderLocation, 'apptileSeed/Info.plist');
    const rawInfoPlist = await readFile(infoPlistLocation, {encoding: 'utf8'});
    const infoPlist = plist.parse(rawInfoPlist);
    infoPlist.APP_ID = apptileConfig.APP_ID;
    infoPlist.APPTILE_API_ENDPOINT = apptileConfig.APPTILE_BACKEND_URL;
    infoPlist.APPTILE_UPDATE_ENDPOINT = apptileConfig.APPCONFIG_SERVER_URL;

    // For onesignal analytics
    if (apptileConfig.feature_flags.ENABLE_ONESIGNAL) {
      infoPlist.ONESIGNAL_APPID = apptileConfig.ONESIGNAL_APPID;
    } else {
      if (infoPlist.ONESIGNAL_APPID) {
        delete infoPlist.ONESIGNAL_APPID;
      }
    }

    // For facebook analytics
    if (apptileConfig.feature_flags.ENABLE_FBSDK) {
      infoPlist.FacebookAppID = apptileConfig.FacebookAppID;
      infoPlist.FacebookClientToken = apptileConfig.FacebookClientToken;
      infoPlist.FacebookDisplayName = apptileConfig.FacebookDisplayName;
      infoPlist.FacebookAutoLogAppEventsEnabled = apptileConfig.FacebookAutoLogAppEventsEnabled;
      infoPlist.FacebookAdvertiserIDCollectionEnabled = apptileConfig.FacebookAdvertiserIDCollectionEnabled;
    } else {
      if (infoPlist.FacebookAppID) {
        delete infoPlist.FacebookAppID;
      }

      if (infoPlist.FacebookClientToken) {
        delete infoPlist.FacebookClientToken;
      }

      if (infoPlist.FacebookDisplayName) {
        delete infoPlist.FacebookDisplayName;
      }

      if (infoPlist.FacebookAutoLogAppEventsEnabled) {
        delete infoPlist.FacebookAutoLogAppEventsEnabled;
      }

      if (infoPlist.FacebookAdvertiserIDCollectionEnabled) { 
        delete infoPlist.FacebookAdvertiserIDCollectionEnabled;
      }
    }

    // For appsflyer analytics
    if (apptileConfig.feature_flags.ENABLE_APPSFLYER) {
      if (apptileConfig.APPSFLYER_DEVKEY && apptileConfig.APPSFLYER_APPID) {
        infoPlist.APPSFLYER_DEVKEY = apptileConfig.APPSFLYER_DEVKEY;
        infoPlist.APPSFLYER_APPID = apptileConfig.APPSFLYER_APPID;
      } else {
        throw new Error("APPSFLYER is enabled but creds not given");
      }
    } else {
      delete infoPlist.APPSFLYER_DEVKEY;
      delete infoPlist.APPSFLYER_APPID;
    }

    // For moengage analytics
    if (apptileConfig.feature_flags.ENABLE_MOENGAGE_ANALYTICS) {
      infoPlist.MOENGAGE_APPID = apptileConfig.MOENGAGE_APPID;
      infoPlist.MOENGAGE_DATACENTER = apptileConfig.MOENGAGE_DATACENTER;
    } else {
      delete infoPlist.MOENGAGE_APPID;
      delete infoPlist.MOENGAGE_DATACENTER;
    }

    const updatedPlist = plist.build(infoPlist);
    console.log("Info.plist updated: " + updatedPlist);
    await writeFile(infoPlistLocation, updatedPlist);

    // Get the manifest to identify latest appconfig, then write appConfig.json and localBundleTracker.json 
    const manifestUrl = `${apptileConfig.APPTILE_BACKEND_URL}/api/v2/app/${apptileConfig.APP_ID}/manifest`;
    console.log('Downloading manifest from ' + manifestUrl);
    const {data: manifest} = await axios.get(manifestUrl);
    console.log('manifest: ', manifest);
    const publishedCommit = manifest.forks[0].publishedCommitId;
    const iosBundle = manifest.codeArtefacts.find((it) => it.type === 'ios-jsbundle');

    const appConfigUrl = `${apptileConfig.APPCONFIG_SERVER_URL}/${apptileConfig.APP_ID}/main/main/${publishedCommit}.json`;
    console.log('Downloading appConfig from: ' + appConfigUrl);
    if (publishedCommit) {
      const appConfigPath = path.resolve(__dirname, 'ios/appConfig.json');
      const writer = createWriteStream(appConfigPath);
      const response = await axios({
        method: 'get',
        url: appConfigUrl,
        responseType: 'stream'
      });
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      console.log('appConfig downloaded');
      const bundleTrackerPath = path.resolve(__dirname, 'ios/localBundleTracker.json');
      await writeFile(bundleTrackerPath, `{"publishedCommitId": ${publishedCommit}, "iosBundleId": ${iosBundle?.id ?? "null"}}`)
      console.log('bundleTrackerPath updated: ', bundleTrackerPath);
    } else {
      console.error("Published appconfig not found! Stopping build.")
      process.exit(1);
    }

  } catch (err) {
    console.error("Uncaught exception in iosProjectSetup: ", err);
    process.exit(1);
  }
}

main();

