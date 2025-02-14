// This file is executed in android/app/apptile.gradle during before android build
// It takes things from apptile.config.json and puts the things in the configuration files of the ios project
// It also generates code wherever necessary
// ----------------------------------------------------
//
// Make sure this script is idempotent. Meaning you can run it at any time and with any configurations and it should
// Update the project with the values in the apptile.config.json without having to reason about things in the codebase itself
// This means you cannot rely on comments in the codebase that will get uncommented or specialized strings that get replaced.
// If you do that, then when you run the script a second time those comments are gone and the script will fail. 
// You must guarantee that the developer of the project can run this script with any changes in apptile.config.json and not 
// have to worry about getting into an irrecoverable state from which recovery is only possible by checking out another version
// of the project. This is what used to happen in the /temp folder strategy and that strategy is painful enough to discourage
// most developers from even running projects with all features specific to the app enabled.

const chalk = require('chalk');
const xml2js = require('xml2js');
const path = require('path');
const axios = require('axios');
const util = require('util');
const {exec: exec_} = require('child_process');
const {readFile, writeFile, mkdir} = require('node:fs/promises');

const {
  downloadFile,
  analyticsTemplate,
  generateAnalytics,
  removeForceUnlinkForNativePackage,
  addForceUnlinkForNativePackage,
  readReactNativeConfigJs,
  writeReactNativeConfigJs,
  getExtraModules,
  downloadIconAndSplash
} = require('./commonProjectSetup');

const exec = util.promisify(exec_);

async function generateIconSet(scriptPath) {
  await exec(
    `${scriptPath} ${path.resolve(__dirname, 'assets', 'icon.png')} ./android/app/src/main`, 
    {cwd: path.resolve(__dirname)}
  );
}

function upsertInStringsXML(parsedStringXML, key, value) {
  let existingEntry = parsedStringXML.resources.string.find(it => it.$.name === key);
  if (!existingEntry) {
    parsedStringXML.resources.string.push({
      _: value, 
      $: {
        name: key
      }
    });
  } else {
    existingEntry._ = value;
  }
}

function removeFromStringsXML(parsedStringXML, key) {
  let existingEntryIndex = parsedStringXML.resources.string.findIndex(it => it.$.name === key);
  if (existingEntryIndex >= 0) {
    parsedStringXML.resources.string.splice(existingEntryIndex, 1);
  }
}

function addFacebook(stringsObj, apptileConfig, extraModules, parsedReactNativeConfig) {
  upsertInStringsXML(stringsObj, 'facebook_app_id', apptileConfig.FacebookAppID);
  upsertInStringsXML(stringsObj, 'facebook_client_token', apptileConfig.FacebookClientToken);
  removeForceUnlinkForNativePackage('react-native-fbsdk-next', extraModules, parsedReactNativeConfig);
}

function removeFacebook(stringsObj, extraModules, parsedReactNativeConfig) {
  removeFromStringsXML(stringsObj, 'facebook_app_id');
  removeFromStringsXML(stringsObj, 'facebook_client_token');
  addForceUnlinkForNativePackage('react-native-fbsdk-next', extraModules, parsedReactNativeConfig);
}

function addOnesignal(stringsObj, apptileConfig, extraModules, parsedReactNativeConfig) {
  upsertInStringsXML(stringsObj, 'ONESIGNAL_APPID', apptileConfig.ONESIGNAL_APPID);
  removeForceUnlinkForNativePackage('react-native-onesignal', extraModules, parsedReactNativeConfig);
}

function removeOnesignal(stringsObj, extraModules, parsedReactNativeConfig) {
  removeFromStringsXML(stringsObj, 'ONESIGNAL_APPID');
  addForceUnlinkForNativePackage('react-native-onesignal', extraModules, parsedReactNativeConfig);
}

function addMoengage(stringsObj, apptileConfig, extraModules, parsedReactNativeConfig) {
  removeForceUnlinkForNativePackage('react-native-moengage', extraModules, parsedReactNativeConfig);
}

function removeMoengage(stringsObj, extraModules, parsedReactNativeConfig) {
  addForceUnlinkForNativePackage('react-native-moengage', extraModules, parsedReactNativeConfig);
}

async function main() {
  const analyticsTemplateRef = {current: analyticsTemplate};
  // Get location of ios folder in project
  const androidFolderLocation = path.resolve(__dirname, 'android');

  // Read apptile.config.json
  console.log("Pulling in configurations from apptile.config.json to Info.plist");
  const apptileConfigRaw = await readFile(
    path.resolve(androidFolderLocation, '../apptile.config.json'), 
    {encoding: 'utf8'}
  );
  const apptileConfig = JSON.parse(apptileConfigRaw);
  try {
    const success = await downloadIconAndSplash(apptileConfig);
    if (success) {
      await generateIconSet(path.resolve(apptileConfig.SDK_PATH, 'packages/apptile-app/devops/scripts/android/iconset-generator.sh'));
    }
  } catch(err) {
    console.error(chalk.red('could not download icon and splash'));
  }
  const extraModules = getExtraModules(apptileConfig);

  // Add strings.xml updates
  const parser = new xml2js.Parser();
  const builder = new xml2js.Builder({headless: true});
  const valuesXmlPath = path.resolve(androidFolderLocation, 'app/src/main/res/values/strings.xml');
  const rawStrings = await readFile(valuesXmlPath, {encoding: 'utf8'});
  const stringsObj = await parser.parseStringPromise(rawStrings)
  upsertInStringsXML(stringsObj, 'app_name', apptileConfig.app_name);
  upsertInStringsXML(stringsObj, 'APPTILE_API_ENDPOINT', apptileConfig.APPTILE_BACKEND_URL);
  upsertInStringsXML(stringsObj, 'APP_ID', apptileConfig.APP_ID);
  upsertInStringsXML(stringsObj, 'APPTILE_UPDATE_ENDPOINT', apptileConfig.APPCONFIG_SERVER_URL);
  const parsedReactNativeConfig = await readReactNativeConfigJs();
  if (apptileConfig.feature_flags.ENABLE_FBSDK) {
    addFacebook(stringsObj, apptileConfig, extraModules, parsedReactNativeConfig)
  } else {
    removeFacebook(stringsObj, extraModules, parsedReactNativeConfig); 
  }

  if (apptileConfig.feature_flags.ENABLE_ONESIGNAL) {
    addOnesignal(stringsObj, apptileConfig, extraModules, parsedReactNativeConfig)
  } else {
    removeOnesignal(stringsObj, extraModules, parsedReactNativeConfig); 
  }

  if (apptileConfig.feature_flags.ENABLE_MOENGAGE) {
    addMoengage(stringsObj, apptileConfig, extraModules, parsedReactNativeConfig)
  } else {
    removeMoengage(stringsObj, extraModules, parsedReactNativeConfig);
  }

  const updatedValuesXml = builder.buildObject(stringsObj);
  await writeFile(valuesXmlPath, updatedValuesXml);


  // Get the manifest to identify latest appconfig, then write appConfig.json and localBundleTracker.json 
  const manifestUrl = `${apptileConfig.APPTILE_BACKEND_URL}/api/v2/app/${apptileConfig.APP_ID}/manifest`;
  console.log('Downloading manifest from ' + manifestUrl);
  const {data: manifest} = await axios.get(manifestUrl);
  // console.log('manifest: ', manifest);
  const publishedCommit = manifest.forks[0].publishedCommitId;
  const androidBundle = manifest.codeArtefacts.find((it) => it.type === 'android-bundle');

  const appConfigUrl = `${apptileConfig.APPCONFIG_SERVER_URL}/${apptileConfig.APP_ID}/main/main/${publishedCommit}.json`;
  console.log('Downloading appConfig from: ' + appConfigUrl);
  if (publishedCommit) {
    const assetsDir = path.resolve(__dirname, 'android/app/src/main/assets');
    await mkdir(assetsDir, {recursive: true});
    const appConfigPath = path.resolve(assetsDir, 'appConfig.json');
    await downloadFile(appConfigUrl, appConfigPath);
    console.log('appConfig downloaded');
    const bundleTrackerPath = path.resolve(__dirname, 'android/app/src/main/assets/localBundleTracker.json');
    await writeFile(bundleTrackerPath, `{"publishedCommitId": ${publishedCommit}, "androidBundleId": ${androidBundle?.id ?? "null"}}`)
  } else {
    console.error("Published appconfig not found! Stopping build.")
    process.exit(1);
  }
  console.log("Running android project setup");
  await generateAnalytics(analyticsTemplateRef, apptileConfig.integrations, apptileConfig.feature_flags);
  await writeReactNativeConfigJs(parsedReactNativeConfig);
  await writeFile(path.resolve(__dirname, 'extra_modules.json'), JSON.stringify(extraModules.current, null, 2));

  // Update google-services.json
  const googleServicesPath = path.resolve(__dirname, 'android', 'app', 'google-services.json');
  let downloadedGoogleServices = false;
  for (let i = 0; i < apptileConfig.assets.length; ++i) {
    try {
      const asset = apptileConfig.assets[i];
      if (asset.assetClass === 'androidFirebaseServiceFile') {
        await downloadFile(asset.url, googleServicesPath);
        downloadedGoogleServices = true;
        break;
      }
    } catch (err) {
      console.error("failed to download google-services.json");
    }
  }

  if (!downloadedGoogleServices) {
    console.log(chalk.red('Failed to download google-services.json. Will try to use the template'));
    const gsRaw = await readFile(googleServicesPath, {encoding: 'utf8'});
    const gsParsed = JSON.parse(gsRaw);
    gsParsed.client[0].client_info.android_client_info.package_name = apptileConfig.android.bundle_id;
    await writeFile(googleServicesPath, JSON.stringify(gsParsed, null, 2));
  }
  /*
  // Write google-services.json from the buildManager api
  try {
    const assets = await axios.get(`https://api.apptile.io/build-manager/api/assets/${appId}`);
    // TODO(gaurav) update the google-services file 
  } catch (err) {
    console.error("Failed to download build assets", err);
  }
  */
}

main();
