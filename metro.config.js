const chalk = require('chalk')
const path = require('path');
const fs = require('fs');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const metroResolver = require('metro-resolver');
require("dotenv/config");

console.log(chalk.yellow(`
=====================================================
start with: metro.config.js
=====================================================
IS_EC2=${process.env.IS_EC2}
`));

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfigs = getDefaultConfig(__dirname);
let rootPath = path.resolve(__dirname, `/Users/gauravgautam/apptile-cli-home/ReactNativeTSProjeect/packages`);

const extraModules = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, 'extra_modules.json'),
    {encoding: 'utf8'}
  )
);

console.log("sdk path: " + rootPath);
const sourceExts = defaultConfigs.resolver.sourceExts;
const config = {
  resolver: {
    sourceExts: [...sourceExts, 'css', 'pcss', 'cjs'],
    resolveRequest: (context, moduleName, platform) => {
      let result = null;
      for (let i = 0; i < extraModules.length; ++i) {
        const mod = extraModules[i];
        if (mod.name === moduleName) {
          result = {
            [mod.returnKey]: mod.path,
            type: mod.returnType
          };
          break;
        }
      }

      if (result) {
        // console.log(result);
        return result;
      } else {
        return metroResolver.resolve({ ...context, resolveRequest: null }, moduleName, platform);
      }
    },
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')]
  },
  watchFolders: [
    path.resolve(__dirname, './node_modules'),
    path.resolve(rootPath, 'apptile-core'),
    path.resolve(rootPath, 'apptile-plugins'),
    path.resolve(rootPath, 'apptile-datasource'),
    path.resolve(rootPath, 'apptile-app/app/assets'),
    path.resolve(rootPath, 'apptile-shopify'),
    // __PLACEHOLDER_WATCH__
  ],
};

module.exports = mergeConfig(defaultConfigs, config);
