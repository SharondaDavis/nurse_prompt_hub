// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add platform-specific resolver configuration
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Ensure proper source map handling
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;