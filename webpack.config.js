var webpack = require('webpack'),
 ExtractTextPlugin = require('extract-text-webpack-plugin'),
 autoprefixer = require('autoprefixer');

module.exports = {
  entry: {
    carma: './index',
  },
  output: {
    path: './build',
    filename: 'carma.min.js'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.scss$/,
        exclude: /(node_modules)/,
        loader: ExtractTextPlugin.extract('style-loader', 'css!postcss!sass')
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff'
      },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader'
      },
      { test: /\.(png|jpg|jpeg|gif)$/, loader: 'url-loader?limit=8192' }
    ]
  },
  postcss: [ autoprefixer({ browsers: ['last 2 version'] }) ],
  plugins: [
    //new webpack.optimize.CommonsChunkPlugin('common.js'),
    /*new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),*/
    new ExtractTextPlugin('[name].css')
  ],
  resolve: {
    extensions: ['', '.js', '.jsx', '.scss']
  }
};
