// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add platform-specific resolver configuration
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Explicitly alias react-native to react-native-web for web builds
config.resolver.extraNodeModules = {
  'react-native': path.resolve(__dirname, 'node_modules/react-native-web'),
};

// Ensure proper source map handling
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;