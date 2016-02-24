module.exports = function configureKarma(config) {
  'use strict';
  config.set({

    basePath: '',

    frameworks: ['mocha', 'chai'],

    preprocessors: {
      'test/*.spec.js': [ 'webpack', 'sourcemap' ]
    },

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          {
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
              presets: ['es2015']
            }
          }
        ],
      }
    },

    webpackMiddleware: {
      noInfo: true,
    },

    files: [
      'test/*.spec.js'
    ],

    reporters: ['mocha'],

    port: 9876,
    colors: true,
    autoWatch: false,
    singleRun: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    browsers: ['PhantomJS']


  });
};
