// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@/config': './config',
            '@/components': './components',
            '@/assets': "./assets",
            '@/app': "./app",
            '@/constants': "./constants",
            '@/contexts': "./contexts",
            '@/hooks': "./hooks",
            '@/services': './services',
            '@/utils': './utils',
            // Add other aliases as needed
          },
        },
      ],
      // Add other plugins here if you have them
      'react-native-reanimated/plugin', // If you're using Reanimated
    ],
  };
};