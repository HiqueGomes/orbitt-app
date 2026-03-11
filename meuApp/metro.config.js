// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@react-native-async-storage/async-storage': path.resolve(
    __dirname,
    'node_modules/@react-native-async-storage/async-storage'
  ),
};

module.exports = config;
