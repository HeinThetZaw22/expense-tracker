const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  "@": path.resolve(__dirname), // root folder as base for @/
};

module.exports = config;
