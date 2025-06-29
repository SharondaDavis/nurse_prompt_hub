module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: 
       'expo-router/babel',       // ← keep this in!
      'react-native-reanimated/plugin' // if you’re using Reanimated
  };
};