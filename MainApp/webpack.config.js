var webpack = require('webpack');
//var autoprefixer = require('autoprefixer');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var path = require('path');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = ENV === 'build';


module.exports = function(env) {
  var config = {};
  config.plugins = [];

  config.entry = isTest ? void 0 : {
    app: ['babel-polyfill','./wwwroot/ReactApp/index.js']
  };

  config.output = isTest ? {} : {
    // Absolute output directory
    path: path.resolve(__dirname, (isProd ? 'wwwroot/dist' : 'wwwroot/distdev')),
    
    // Filename for entry points
    // Only adds hash in build mode
    filename: isProd ? '[name].[hash].js' : '[name].bundle.js',

    // Filename for non-entry points
    // Only adds hash in build mode
    chunkFilename: isProd ? '[name].[hash].js' : '[name].bundle.js'
  };

  if (isTest) {
    config.devtool = 'eval';
  }
  else if (isProd) {
    config.devtool = 'source-map';
  }
  else {
    config.devtool = 'eval-source-map';
  }

  config.module = {
    rules: [{
      // JS LOADER
      // Reference: https://github.com/babel/babel-loader
      // Transpile .js files using babel-loader
      // Compiles ES6 and ES7 into ES5 code
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/env', '@babel/react'],
          plugins: ['@babel/plugin-proposal-class-properties','transform-regenerator']
        }
      },
      exclude: /node_modules/
    }, {
      // CSS LOADER
      // Reference: https://github.com/webpack/css-loader
      // Allow loading css through js
      //
      // Reference: https://github.com/postcss/postcss-loader
      // Postprocess your css with PostCSS plugins
      test: /\.css$/,
      // Reference: https://github.com/webpack/extract-text-webpack-plugin
      // Extract css files in production builds
      //
      // Reference: https://github.com/webpack/style-loader
      // Use style-loader in development.

      loader: isTest ? 'null-loader' : isProd ? [MiniCssExtractPlugin.loader, 'css-loader'] : ['style-loader','css-loader']
    }, {
      // ASSET LOADER
      // Reference: https://github.com/webpack/file-loader
      // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
      // Rename the file using the asset hash
      // Pass along the updated reference to your code
      // You can add here any file extension you want to get copied to your output
      test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
      loader: 'file-loader'      
    }, 
    {
      // HTML LOADER
      // Reference: https://github.com/webpack/raw-loader
      // Allow loading html through js
      test: /\.html$/,
      loader: 'raw-loader'
    }]
  };

  if (isProd) {
    config.plugins.push(
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
          })
    )
  }

  return config;
}();