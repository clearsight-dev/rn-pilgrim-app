// This file is executed in the 'Apptile Setup' build phases step in the ios project.
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

// const xcode = require('xcode');
const plist = require('plist');
const path = require('path');
const axios = require('axios');
const util = require('util');
const {exec: exec_} = require('child_process');
const {readFile, writeFile, readdir, rmdir, mkdir, rename} = require('node:fs/promises');
const {createWriteStream} = require('fs');

const exec = util.promisify(exec_);

async function generateIconSet(scriptPath) {
  await exec(`${scriptPath} ${path.resolve(__dirname, 'assets', 'icon.png')} ./`, {cwd: path.resolve(__dirname)});
  await rmdir(path.resolve(__dirname, 'ios', 'apptileSeed', 'Images.xcassets'), {recursive: true});
  await rename(
    path.resolve(__dirname, 'Images.xcassets'), 
    path.resolve(__dirname, 'ios', 'apptileSeed', 'Images.xcassets')
  );
}

async function writeReactNativeConfigJs(parsedReactNativeConfig) {
  const updatedConfig = `module.exports = ${JSON.stringify(parsedReactNativeConfig, null, 2)}`;
  await writeFile(path.resolve(__dirname, 'react-native.config.js'), updatedConfig);
}

async function readReactNativeConfigJs() {
  const contents = await readFile(path.resolve(__dirname, 'react-native.config.js'), {encoding: 'utf8'});
  const parsable = contents.replace(/module.exports\s?=/, '');
  const parsedConfig = JSON.parse(parsable);
  return parsedConfig;
}

async function downloadFile(url, fileName) {
  const outputPath = path.resolve(__dirname, 'assets', fileName); 
  try {
    const response = await axios({
      url, 
      method: 'GET',
      responseType: 'stream'
    });

    const writer = createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch(err) {
    console.error("Failed to download asset ", fileName, err);
  }
}

const packageStubs = {
  'react-native-fbsdk-next': `
export const AppEventsLogger = {
  AppEventParams: {
    AppEventParams: {},
    Content: {},
    Currency: {},
    NumItems: {},
    SearchString: {},
    ContentID: {}
  }, 
  AppEvents: {
    AddedToCart: {},
    InitiatedCheckout: {},
    Purchased: {},
    Searched: {},
    ViewedContent: {},
    AddedToWishlist: {}
  },
  logEvent: () => console.log('subbed facebook logEvent')
};
export default {}
`,
  'react-native-moengage': `export default {}`,

  'react-native-appsflyer': `export default { 
onDeepLink: () => console.log('stubbed appsflyer onDeeplink')
};`

};

async function removeForceUnlinkForNativePackage(packageName, extraModules, parsedReactNativeConfig) {
  // remove unlinker from react-native.config.js
  if (parsedReactNativeConfig.dependencies[packageName]) {
    delete parsedReactNativeConfig.dependencies[packageName];
  }

  // remove stub file if it exists
  let exists = false;
  try {
    const entries = await readdir(path.resolve(__dirname, 'stubs'), {withFileTypes: true});
    for (let i = 0; i < entries.length; ++i) {
      if (entries[i].isDirectory() && entries[i].name === packageName) {
        exists = true;
        break;
      }
    }
  } catch (err) {
    if (err?.code === 'ENOENT') {
      exists = false;
    } else {
      throw err;
    }
  }

  if (exists) {
    await rmdir(path.resolve(__dirname, 'stubs', packageName), {recursive: true});
  }

  // remove react-native-fbsdk-next from metro.config.js if it exists
  extraModules.current = extraModules.current.filter(mod => mod.name !== packageName);
}

async function addForceUnlinkForNativePackage(packageName, extraModules, parsedReactNativeConfig) {
  // add unlinker in react-native.config.js
  parsedReactNativeConfig.dependencies[packageName] = {
    platforms: {
      android: null, 
      ios: null
    }
  };
  
  // remove stub file if exists
  let exists = false;
  try {
    const entries = await readdir(path.resolve(__dirname, 'stubs'), {withFileTypes: true});
    for (let i = 0; i < entries.length; ++i) {
      if (entries[i].isDirectory() && entries[i].name === packageName) {
        exists = true;
        break;
      }
    }
  } catch (err) {
    if (err?.code === 'ENOENT') {
      exists = false;
    } else {
      throw err;
    }
  }

  if (!exists) {
    await mkdir(
      path.resolve(__dirname, `stubs/${packageName}`),
      {recursive: true}
    );
    await writeFile(
      path.resolve(__dirname, `stubs/${packageName}/index.ts`), 
      packageStubs[packageName]
    );
  }

  // update metro.config.js
  const existing = extraModules.current.find(it => it.name == packageName);
  if (!existing) {
    extraModules.current.push({
      "name": packageName,
      "path": path.resolve(__dirname, `stubs/${packageName}/index.ts`),
      "watchPath": path.resolve(extraModules.SDK_PATH, "packages/apptile-core"),
      "returnKey": "filePath",
      "returnType": "sourceFile"
    });
  }
}

async function addMoengage(
  analyticsTemplateRef, 
  infoPlist, 
  notificationContentInfoPlist,
  apptileConfig,
  parsedReactNativeConfig,
  extraModules
) {
  // Update analytics file
  analyticsTemplateRef.current = analyticsTemplateRef.current.replace(
    /\/\/ __ENABLED_ANALYTICS_IMPORTS__/g, 
    `Moengage as MoengageAnalytics,\n  \/\/ __ENABLED_ANALYTICS_IMPORTS__`
  );
   
  const moengageIntegration = apptileConfig.integrations.moengage;
  infoPlist.MOENGAGE_APPID = moengageIntegration.appId;
  infoPlist.MOENGAGE_DATACENTER = moengageIntegration.datacenter;
  infoPlist.MoEngageAppDelegateProxyEnabled = false;
  infoPlist.MoEngage = {
    ENABLE_LOGS: false,
    MOENGAGE_APP_ID: moengageIntegration.appId,
    DATA_CENTER: moengageIntegration.datacenter,
    APP_GROUP_ID: `group.${apptileConfig.ios.bundle_id}.notification`
  }
  notificationContentInfoPlist.NSExtension.NSExtensionAttributes.UNNotificationExtensionCategory =  "MOE_PUSH_TEMPLATE";
  notificationContentInfoPlist.NSExtension.NSExtensionAttributes.UNNotificationExtensionInitialContentSizeRatio = 1.2;
  notificationContentInfoPlist.NSExtension.NSExtensionAttributes.UNNotificationExtensionUserInteractionEnabled = true;
  notificationContentInfoPlist.NSExtension.NSExtensionAttributes.UNNotificationExtensionDefaultContentHidden = true;
  
  await removeForceUnlinkForNativePackage('react-native-moengage', extraModules, parsedReactNativeConfig);
}

async function removeMoengage(
  infoPlist, 
  notificationContentInfoPlist,
  extraModules,
  parsedReactNativeConfig
) {
  delete infoPlist.MOENGAGE_APPID;
  delete infoPlist.MOENGAGE_DATACENTER;
  delete infoPlist.MoEngageAppDelegateProxyEnabled;
  delete infoPlist.MoEngage;
  delete notificationContentInfoPlist.NSExtension.NSExtensionAttributes.UNNotificationExtensionCategory;
  delete notificationContentInfoPlist.NSExtension.NSExtensionAttributes.UNNotificationExtensionInitialContentSizeRatio;
  delete notificationContentInfoPlist.NSExtension.NSExtensionAttributes.UNNotificationExtensionUserInteractionEnabled;
  delete notificationContentInfoPlist.NSExtension.NSExtensionAttributes.UNNotificationExtensionDefaultContentHidden;

  await addForceUnlinkForNativePackage('react-native-moengage', extraModules, parsedReactNativeConfig);
}

async function addAppsflyer(
  analyticsTemplateRef, 
  infoPlist, 
  notificationContentInfoPlist,
  apptileConfig,
  parsedReactNativeConfig,
  extraModules
) {
  // Update analytics file
  analyticsTemplateRef.current = analyticsTemplateRef.current.replace(
    /\/\/ __ENABLED_ANALYTICS_IMPORTS__/g, 
    `AppsFlyer as AppsFlyerAnalytics,\n  \/\/ __ENABLED_ANALYTICS_IMPORTS__`
  );
   
  const appsflyerIntegration = apptileConfig.integrations.appsflyer;
  infoPlist.APPSFLYER_DEVKEY = appsflyerIntegration.devkey;
  infoPlist.APPSFLYER_APPID = appsflyerIntegration.appId;
  
  removeForceUnlinkForNativePackage('react-native-appsflyer', extraModules, parsedReactNativeConfig);
}

async function removeAppsflyer(
  infoPlist, 
  notificationContentInfoPlist,
  extraModules,
  parsedReactNativeConfig
) {
  delete infoPlist.APPSFLYER_DEVKEY;
  delete infoPlist.APPSFLYER_APPID;

  await addForceUnlinkForNativePackage('react-native-appsflyer', extraModules, parsedReactNativeConfig);
}

async function addFacebook(
  analyticsTemplateRef, 
  infoPlist, 
  notificationContentInfoPlist,
  apptileConfig,
  parsedReactNativeConfig,
  extraModules
) {
  // Update analytics file
  analyticsTemplateRef.current = analyticsTemplateRef.current.replace(
    /\/\/ __ENABLED_ANALYTICS_IMPORTS__/g, 
    `Facebook as FacebookAnalytics,\n  \/\/ __ENABLED_ANALYTICS_IMPORTS__`
  );
   
  const metaIntegration = apptileConfig.integrations.metaAds;
  infoPlist.FacebookAppID = metaIntegration.FacebookAppId;
  infoPlist.FacebookClientToken = metaIntegration.FacebookClientToken;
  infoPlist.FacebookDisplayName = metaIntegration.FacebookDisplayName;
  infoPlist.FacebookAutoLogAppEventsEnabled = metaIntegration.FacebookAutoLogAppEventsEnabled;
  infoPlist.FacebookAdvertiserIDCollectionEnabled = metaIntegration.FacebookAdvertiserIDCollectionEnabled;
  removeForceUnlinkForNativePackage('react-native-fbsdk-next', extraModules, parsedReactNativeConfig);
}

async function removeFacebook(
  infoPlist, 
  notificationContentInfoPlist,
  extraModules,
  parsedReactNativeConfig
) {
  delete infoPlist.FacebookAppID;
  delete infoPlist.FacebookClientToken;
  delete infoPlist.FacebookDisplayName;
  delete infoPlist.FacebookAutoLogAppEventsEnabled;
  delete infoPlist.FacebookAdvertiserIDCollectionEnabled;
  addForceUnlinkForNativePackage('react-native-fbsdk-next', extraModules, parsedReactNativeConfig);
}

async function generateAnalytics(analyticsTemplateRef, integrations, featureFlags) {
  integrations = integrations || {};
  let enabledAnalytics = '';
  if (featureFlags.ENABLE_FBSDK) {
    enabledAnalytics += `FacebookAnalytics,\n      `;
  }

  if (featureFlags.ENABLE_APPSFLYER) {
    enabledAnalytics += `AppsFlyerAnalytics,\n      `;
  }

  if (featureFlags.ENABLE_MOENGAGE) {
    enabledAnalytics += `MoengageAnalytics,\n      `;
  }
  enabledAnalytics += `// __ENABLED_ANALYTICS__`;

  analyticsTemplateRef.current = analyticsTemplateRef.current.replace(/\/\/ __ENABLED_ANALYTICS__/g, enabledAnalytics); 
  if (integrations.shopify) {
    analyticsTemplateRef.current = analyticsTemplateRef.current.replace(
      /\/\/ __EXTRA_LEGACY_INITIALIZERS__/, 
      `loadShopifyPlugins();\n// __EXTRA_LEGACY_INITIALIZERS__`
    );
    analyticsTemplateRef.current = analyticsTemplateRef.current.replace(
      /\/\/ __EXTRA_LEGACY_PLUGIN_IMPORTS__/,
      `import { loadDatasourcePlugins as loadShopifyPlugins } from 'apptile-shopify';\n// __EXTRA_LEGACY_PLUGIN_IMPORTS__`
    );
  }
  return writeFile(path.resolve(__dirname, 'analytics/index.ts'), analyticsTemplateRef.current);
}

async function main() {
  const analyticsTemplateRef = {
    current: `// This file is generated at build time based on the integrations added to the app
import {checkATTPermission, ApptileAnalytics, addCustomEventListener} from 'apptile-core';
import {
  Firebase as FirebaseAnalytics, 
  // __ENABLED_ANALYTICS_IMPORTS__
} from 'apptile-core';

import {
  initStoreWithRootSagas,
} from 'apptile-core';

import { loadDatasourcePlugins } from 'apptile-datasource';
import { initPlugins } from 'apptile-plugins';
// __EXTRA_LEGACY_PLUGIN_IMPORTS__

import { initNavs } from '../remoteCode/indexNav';
import { initPlugins as initRemotePlugins } from '../remoteCode';

initStoreWithRootSagas();
loadDatasourcePlugins();
initPlugins();
initRemotePlugins();
initNavs();

// The plugins initialized here will not be available in the web
// as an addon. This is only meant for toggling exsiting plugins which
// are tightly integrated with apptile-core. Use remoteCode folder for 
// everything else
// __EXTRA_LEGACY_INITIALIZERS__

export async function init() {
  try {
    await checkATTPermission();
    await ApptileAnalytics.initialize([
      FirebaseAnalytics, 
      // __ENABLED_ANALYTICS__
    ]);
  } catch (err) {
    console.error('Failure in initializing ApptileAnalytics');
  }
}

addCustomEventListener('ApptileAnalyticsSendEvent', (type, name, params) => {
  ApptileAnalytics.sendEvent(type, name, params);
});`
  };

  

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
    for (let i = 0; i < apptileConfig.assets.length; ++i) {
      const asset = apptileConfig.assets[i];
      if (asset.assetClass === 'splash') {
        console.log("Downloading splash");
        await downloadFile(asset.url, asset.fileName);
      } else if (asset.assetClass === 'icon') {
        await downloadFile(asset.url, asset.fileName);
        await generateIconSet(path.resolve(apptileConfig.SDK_PATH, 'packages/apptile-app/devops/scripts/ios/iconset-generator.sh'));
      }
    }

    const extraModules = {
      SDK_PATH: apptileConfig.SDK_PATH,
      current: [
        {
          "name": "apptile-core",
          "path": path.resolve(apptileConfig.SDK_PATH, "packages/apptile-core/sdk.ts"),
          "watchPath": path.resolve(apptileConfig.SDK_PATH, "packages/apptile-core"),
          "returnKey": "filePath",
          "returnType": "sourceFile"
        },
        {
          "name": "apptile-plugins",
          "path": path.resolve(apptileConfig.SDK_PATH, "packages/apptile-plugins/index.ts"),
          "watchPath": path.resolve(apptileConfig.SDK_PATH, "packages/apptile-plugins"),
          "returnKey": "filePath",
          "returnType": "sourceFile"
        },
        {
          "name": "asset_placeholder-image",
          "path": [path.resolve(apptileConfig.SDK_PATH, "packages/apptile-app/app/assets/image-placeholder.png")],
          "watchPath": path.resolve(apptileConfig.SDK_PATH, "packages/apptile-app/app/assets"),
          "returnKey": "filePaths",
          "returnType": "assetFiles"
        },
        {
          "name": "apptile-datasource",
          "path": path.resolve(apptileConfig.SDK_PATH, "packages/apptile-datasource/index.ts"),
          "watchPath": path.resolve(apptileConfig.SDK_PATH, "packages/apptile-datasource"),
          "returnKey": "filePath",
          "returnType": "sourceFile"
        },
        {
          "name": "apptile-shopify",
          "path": path.resolve(apptileConfig.SDK_PATH, "packages/apptile-shopify/index.ts"),
          "watchPath": path.resolve(apptileConfig.SDK_PATH, "packages/apptile-shopify"),
          "returnKey": "filePath",
          "returnType": "sourceFile"
        },
      ]
    };

    // Notification Content extension Info.plist
    const notificationContentExtensionInfoPlistLocation = path.resolve(iosFolderLocation, 'NotificationContentExtension/Info.plist');
    const rawNotificationContentExtensionPlist = await readFile(notificationContentExtensionInfoPlistLocation, {encoding: 'utf8'});
    const notificationContentExtensionPlist = plist.parse(rawNotificationContentExtensionPlist);

    // Entitlements
    const apptileSeedEntitlementsLocation = path.resolve(iosFolderLocation, 'apptileSeed', 'apptileSeed.entitlements');
    const rawApptileSeedEntitlements = await readFile(apptileSeedEntitlementsLocation, {encoding: 'utf8'});
    const apptileSeedEntitlements = plist.parse(rawApptileSeedEntitlements);

    const imageNotificationEntitlementsLocation = path.resolve(iosFolderLocation, 'ImageNotification', 'ImageNotification.entitlements');
    const rawImageNotifEntitlements = await readFile(imageNotificationEntitlementsLocation, {encoding: 'utf8'});
    const imageNotificationEntitlements = plist.parse(rawImageNotifEntitlements);

    const notificationContentEntitlementsLocation = path.resolve(iosFolderLocation, 'NotificationContentExtension', 'NotificationContentExtension.entitlements');
    const rawNotifContentEntitlements = await readFile(notificationContentEntitlementsLocation, {encoding: 'utf8'});
    const notificationContentEntitlements = plist.parse(rawNotifContentEntitlements);


    // Add Info.plist updates
    const infoPlistLocation = path.resolve(iosFolderLocation, 'apptileSeed/Info.plist');
    const rawInfoPlist = await readFile(infoPlistLocation, {encoding: 'utf8'});
    const infoPlist = plist.parse(rawInfoPlist);

    infoPlist.APPTILE_API_ENDPOINT = apptileConfig.APPTILE_BACKEND_URL;
    infoPlist.APPTILE_UPDATE_ENDPOINT = apptileConfig.APPCONFIG_SERVER_URL;
    infoPlist.APP_ID = apptileConfig.APP_ID;
    infoPlist.CFBundleDisplayName = apptileConfig.app_name || 'Apptile Seed';

    const bundle_id = apptileConfig.ios.bundle_id || 'com.apptile.apptilepreviewdemo';

    apptileSeedEntitlements['com.apple.security.application-groups'] = [`group.${bundle_id}.notification`];
    imageNotificationEntitlements['com.apple.security.application-groups'] = [`group.${bundle_id}.notification`];


    // For facebook analytics
    const parsedReactNativeConfig = await readReactNativeConfigJs();
    if (apptileConfig.feature_flags.ENABLE_FBSDK) {
      await addFacebook(analyticsTemplateRef, infoPlist, notificationContentExtensionPlist, apptileConfig, parsedReactNativeConfig, extraModules);
    } else {
      await removeFacebook(infoPlist, notificationContentExtensionPlist, extraModules, parsedReactNativeConfig);
    }

    // For appsflyer analytics
    if (apptileConfig.feature_flags.ENABLE_APPSFLYER) {
      await addAppsflyer(analyticsTemplateRef, infoPlist, notificationContentExtensionPlist, apptileConfig, parsedReactNativeConfig, extraModules)
    } else {
      await removeAppsflyer(infoPlist, notificationContentExtensionPlist, extraModules, parsedReactNativeConfig);
    }

    // For moengage analytics
    if (apptileConfig.feature_flags.ENABLE_MOENGAGE) {
      await addMoengage(analyticsTemplateRef, infoPlist, notificationContentExtensionPlist, apptileConfig, parsedReactNativeConfig, extraModules)
    } else {
      await removeMoengage(infoPlist, notificationContentExtensionPlist, extraModules, parsedReactNativeConfig);
    }

    const updatedPlist = plist.build(infoPlist);
    await writeFile(infoPlistLocation, updatedPlist);

    const updatedApptileSeedEntitlements = plist.build(apptileSeedEntitlements);
    await writeFile(apptileSeedEntitlementsLocation, updatedApptileSeedEntitlements);

    const updatedImagenotifEntitlements = plist.build(imageNotificationEntitlements);
    await writeFile(imageNotificationEntitlementsLocation, updatedImagenotifEntitlements);

    const updatedNotifContentEntitlements = plist.build(notificationContentEntitlements);
    await writeFile(notificationContentEntitlementsLocation, updatedNotifContentEntitlements);
    

    // Get the manifest to identify latest appconfig, then write appConfig.json and localBundleTracker.json 
    // TODO(gaurav): use the cdn here as well
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
    await generateAnalytics(analyticsTemplateRef, apptileConfig.integrations, apptileConfig.feature_flags);
    await writeReactNativeConfigJs(parsedReactNativeConfig);
    await writeFile(path.resolve(__dirname, 'extra_modules.json'), JSON.stringify(extraModules.current, null, 2));
  } catch (err) {
    console.error("Uncaught exception in iosProjectSetup: ", err);
    process.exit(1);
  }
}

main();


