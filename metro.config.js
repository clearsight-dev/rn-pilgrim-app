const chalk = require('chalk')
const path = require('path');
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
let rootPath = path.resolve(__dirname, `../ReactNativeTSProjeect/packages`);

console.log("sdk path: " + rootPath);
const sourceExts = defaultConfigs.resolver.sourceExts;
const config = {
  resolver: {
    sourceExts: [...sourceExts, 'css', 'pcss', 'cjs'],
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'apptile-core') {
        let filePath = path.resolve(rootPath, 'apptile-core/sdk.ts');

        return {
          filePath,
          type: 'sourceFile'
        };
      } else if (moduleName === 'apptile-plugins') {
        let filePath = path.resolve(rootPath, 'apptile-plugins/index.ts');

        return {
          filePath,
          type: 'sourceFile'
        };
      } else if (moduleName === 'asset_placeholder-image') {
        let filePaths = [path.resolve(rootPath, 'apptile-app/app/assets/image-placeholder.png')];
        return {
          filePaths,
          type: 'assetFiles'
        };
      } else if (moduleName === 'apptile-shopify') {
        let filePath = path.resolve(rootPath, 'apptile-shopify/index.ts');
        return {
          filePath,
          type: 'sourceFile'
        };
      } else if (moduleName === 'apptile-datasource') {
        let filePath = path.resolve(rootPath, 'apptile-datasource/index.ts');
        return {
          filePath,
          type: 'sourceFile'
        };
      }
      return metroResolver.resolve({ ...context, resolveRequest: null }, moduleName, platform);
    },
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')]
  },
  watchFolders: [
    path.resolve(__dirname, './node_modules'),
    path.resolve(rootPath, 'apptile-core'),
    path.resolve(rootPath, 'apptile-plugins'),
    path.resolve(rootPath, 'apptile-shopify'),
    path.resolve(rootPath, 'apptile-datasource'),
    path.resolve(rootPath, 'apptile-app/app/assets'),
  ],
};

module.exports = mergeConfig(defaultConfigs, config);
