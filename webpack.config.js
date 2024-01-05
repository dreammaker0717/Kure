const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
// const Dotenv = require('dotenv-webpack');
const { InjectManifest } = require('workbox-webpack-plugin');
const webpack = require("webpack");
// const CopyPlugin = require('copy-webpack-plugin');
const webpackPlugins = [
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, 'public/index.html'),
    filename: 'index.html',
  }),
  new webpack.ProvidePlugin({
    "React": "react",
  }),
  // new Dotenv({
  //   path: './.env', // Path to .env file (this is the default)
  //   systemvars: true,
  // }),
  // new CopyPlugin({
  //   patterns: [
  //     { from: './src/favicon.ico', to: '' },
  //     { from: './src/manifest.json', to: '' },
  //     { from: './src/logo192.png', to: '' },
  //     { from: './src/logo512.png', to: '' },
  //   ],
  // }),
];
if (process.env.NODE_ENV === 'production') {
  webpackPlugins.push(new InjectManifest({
    swSrc: './src/src-sw.js',
    swDest: 'sw.js',
  }));
  webpackPlugins.push(new InjectManifest({
    swSrc: './src/src-firebase.js',
    swDest: 'firebase.js',
  }));
}
module.exports = {
  context: __dirname,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'main.js',
    publicPath: '/',
  },
  devServer: {
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      pages: path.resolve(__dirname, 'src/pages'),
      components: path.resolve(__dirname, 'src/components'),
      routes: path.resolve(__dirname, 'src/routes'),
      theme: path.resolve(__dirname, 'src/theme'),
      utils: path.resolve(__dirname, 'src/utils'),
      hooks: path.resolve(__dirname, 'src/hooks'),
      config: path.resolve(__dirname, 'src/config'),
      assets: path.resolve(__dirname, 'src/assets'),
      store: path.resolve(__dirname, 'src/store'),
      layout: path.resolve(__dirname, 'src/layout'),
      menuItems: path.resolve(__dirname, 'src/menuItems'),
      Common: path.resolve(__dirname, 'src/Common'),
      request: path.resolve(__dirname, 'src/request'),
      services: path.resolve(__dirname, 'src/services'),
      'order/orderManager': path.resolve(__dirname, 'src/order/orderManager'),
      'swipeable/swipeable': path.resolve(__dirname, 'src/swipeable/swipeable'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css?$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|svg|gif)?$/,
        use: 'file-loader?name=./images/[name].[ext]',
      },
      {
        test: /\.mp3$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[contenthash].[ext]',
              outputPath: 'assets/sounds/',
              publicPath: 'assets/sounds/',
            },
          },
        ],
      },
    ],
  },
  plugins: webpackPlugins
};