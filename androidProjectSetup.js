// This file is executed in android/app/apptile.gradle during before android build
const xml2js = require('xml2js');
const path = require('path');
const axios = require('axios');
const {readFile, writeFile, mkdir} = require('node:fs/promises');
const {createWriteStream} = require('fs');

async function main() {
  // Get location of ios folder in project
  const androidFolderLocation = path.resolve(__dirname, 'android');

  // Read apptile.config.json
  console.log("Pulling in configurations from apptile.config.json to Info.plist");
  const apptileConfigRaw = await readFile(
    path.resolve(androidFolderLocation, '../apptile.config.json'), 
    {encoding: 'utf8'}
  );
  const apptileConfig = JSON.parse(apptileConfigRaw);

  // Add strings.xml updates
  const parser = new xml2js.Parser();
  const builder = new xml2js.Builder({headless: true});
  const valuesXmlPath = path.resolve(androidFolderLocation, 'app/src/main/res/values/strings.xml');
  const rawStrings = await readFile(valuesXmlPath, {encoding: 'utf8'});
  const stringsObj = await parser.parseStringPromise(rawStrings)
  let APPTILE_API_ENDPOINT_ENTRY = stringsObj.resources.string.find(it => it.$.name === 'APPTILE_API_ENDPOINT');
  if (!APPTILE_API_ENDPOINT_ENTRY) {
    stringsObj.resources.string.push({
      _: apptileConfig.APPTILE_BACKEND_URL, 
      $: {
        name: 'APPTILE_API_ENDPOINT'
      }
    });
  } else {
    APPTILE_API_ENDPOINT_ENTRY._ = apptileConfig.APPTILE_BACKEND_URL;
  }

  let APPTILE_UPDATE_ENDPOINT_ENTRY = stringsObj.resources.string.find(it => it.$.name === 'APPTILE_UPDATE_ENDPOINT');
  if (!APPTILE_UPDATE_ENDPOINT_ENTRY) {
    stringsObj.resources.string.push({
      _: apptileConfig.APPCONFIG_SERVER_URL, 
      $: {
        name: 'APPTILE_UPDATE_ENDPOINT'
      }
    });
  } else {
    APPTILE_UPDATE_ENDPOINT_ENTRY._ = apptileConfig.APPCONFIG_SERVER_URL;
  }

  let FacebookAppID = stringsObj.resources.string.find(it => it.$.name === 'facebook_app_id');
  if (!FacebookAppID) {
    stringsObj.resources.string.push({
      _: apptileConfig.FacebookAppID, 
      $: {
        name: 'facebook_app_id'
      }
    });
  } else {
    FacebookAppID._ = apptileConfig.FacebookAppID;
  }

  let FacebookClientToken = stringsObj.resources.string.find(it => it.$.name === 'facebook_client_token');
  if (!FacebookClientToken) {
    stringsObj.resources.string.push({
      _: apptileConfig.FacebookClientToken, 
      $: {
        name: 'facebook_client_token'
      }
    });
  } else {
    FacebookClientToken._ = apptileConfig.FacebookClientToken;
  }


  const updatedValuesXml = builder.buildObject(stringsObj);
  console.log("strings.xml updated: " + updatedValuesXml);
  await writeFile(valuesXmlPath, updatedValuesXml);


  // Get the manifest to identify latest appconfig, then write appConfig.json and localBundleTracker.json 
  const {data: manifest} = await axios.get(`${apptileConfig.APPTILE_BACKEND_URL}/api/v2/app/${apptileConfig.APP_ID}/manifest`);
  const publishedCommit = manifest.forks[0].publishedCommitId;
  const androidBundle = manifest.codeArtefacts.find((it) => it.type === 'android-bundle');

  const appConfigUrl = `${apptileConfig.APPCONFIG_SERVER_URL}/${apptileConfig.APP_ID}/main/main/${publishedCommit}.json`;
  if (publishedCommit) {
    const assetsDir = path.resolve(__dirname, 'android/app/src/main/assets');
    await mkdir(assetsDir, {recursive: true});
    const appConfigPath = path.resolve(assetsDir, 'appConfig.json');
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
    const bundleTrackerPath = path.resolve(__dirname, 'android/app/src/main/assets/localBundleTracker.json');
    await writeFile(bundleTrackerPath, `{"publishedCommitId": ${publishedCommit}, "androidBundleId": ${androidBundle?.id ?? "null"}}`)
  } else {
    console.error("Published appconfig not found! Stopping build.")
    process.exit(1);
  }
  console.log("Running android project setup");

  // Write google-services.json from the buildManager api
  try {
    const assets = await axios.get(`https://api.apptile.io/build-manager/api/assets/${appId}`);
    // TODO(gaurav) update the google-services file 
  } catch (err) {
    console.error("Failed to download build assets", err);
  }
}

main();
