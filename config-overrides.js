/**
 * This file prevents webpack from adding hashes to filenames
 */
const { override, adjustStyleLoaders } = require("customize-cra");

module.exports = override((config) => {
  if (config.output) {
    config.output.filename = "static/js/[name].js";
    config.output.chunkFilename = "static/js/[name].chunk.js";
  }

  // Adjust output filenames for CSS
  config.plugins.forEach((plugin) => {
    if (plugin.constructor.name === "MiniCssExtractPlugin") {
      plugin.options.filename = "static/css/[name].css";
      plugin.options.chunkFilename = "static/css/[name].chunk.css";
    }
  });

  return config;
},

// Ensure CSS is processed correctly
adjustStyleLoaders((rule) => {
  if (rule.test && String(rule.test).includes("css")) {
    if (rule.use) {
      rule.use.forEach((loader) => {
        if (
          loader.loader &&
          loader.loader.includes("css-loader")
        ) {
          loader.options = {
            ...loader.options          };
        }
      });
    }
  }
}));