'use strict';

let webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');

let vendorModules = /(node_modules|bower_components)/;

module.exports = {
  // target: 'web',
  watch: true,
  node: {
    fs: "empty"
  },
  entry: {
    s3: './src/main.js',
    'helpers.min': './src/helpers.js',
  },
  output: {
    // library: ['Helpers', 'SQLRecords'],
    path: './www/js/libs/',
    filename: '[name].js',
  },

  module: {
    loaders: [
      {
        test: /\.js/,
        exclude: vendorModules,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'es2017'],
          plugins: [
            'transform-runtime',
            'transform-es2015-destructuring',
            'transform-object-rest-spread',
            'transform-async-to-generator',
            'typecheck',
            'closure-elimination',
            "transform-object-assign",
          ]        
        },
      }
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
      exclude: /helpers\.min\.js/g
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: true,
      comments: false,
      mangle: true,
      beautify: false,
      exclude: /s3\.js/g
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    // new webpack.HotModuleReplacementPlugin(),
    // new CleanWebpackPlugin(['./www/js/libs/*.hot-update.js', './www/js/libs/*.hot-update.json', './www/js/libs/record-media.js'], {
    //   watch: true,
    //   exclude: ['index.js', 'libs']
    // })
  ],
};