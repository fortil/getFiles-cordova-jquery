'use strict';

let webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
let vendorModules = /(node_modules|bower_components)/;

module.exports = {
  // target: 'web',
  watch: true,
  entry: {
    websql: './src/websql.ts',
    // 'helpers.min': './src/helpers.js',
  },
  output: {
    // library: ['Helpers', 'SQLRecords'],
    path: './www/js/libs/',
    filename: '[name].js',
  },

  module: {
    loaders: [
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" }
    ],
  },
  // Externals para johnny-five  
  /*externals: ['bindings'],*/
  //
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: false,
      comments: false,
      mangle: false,
      beautify: true,
      // exclude: /helpers\.min\.js/g
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: true,
    //   comments: false,
    //   mangle: true,
    //   beautify: false,
    //   exclude: /getfiles\.js/g
    // }),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    //   }
    // }),
    // new WebpackShellPlugin({
    //   onBuildStart: ['echo "Starting"'],
    //   onBuildEnd: ['cordova run android'],
    //   dev: false
    // })
    // new webpack.HotModuleReplacementPlugin(),
    // new CleanWebpackPlugin(['./www/js/libs/*.hot-update.js', './www/js/libs/*.hot-update.json', './www/js/libs/record-media.js'], {
    //   watch: true,
    //   exclude: ['index.js', 'libs']
    // })
  ],
};
