const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add “expo-router” to the list of modules that Metro will transform:
config.resolver.blacklistRE = null;
config.transformer = {
  ...config.transformer,
  // ensure .cjs files (used by expo-router) get run through Babel
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
