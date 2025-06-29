const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure all platforms are supported
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for additional file extensions
config.resolver.sourceExts.push('sql');

// Fix getDevServer to be a function that returns the original object
if (config.getDevServer && typeof config.getDevServer !== 'function') {
  const originalDevServer = config.getDevServer;
  config.getDevServer = () => originalDevServer;
}

module.exports = config;