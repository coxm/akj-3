const path = require('path');
const webpack = require('webpack');


const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

if (!process.env.NODE_ENV) {
  throw new Error("No NODE_ENV setting");
}
const IS_PROD = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || '3000';
const HOST = process.env.HOST || 'localhost';
const REPO_ROOT = path.resolve(__dirname, '..');


process.traceDeprecation = true;


const title = 'Phaser3 ES6 Game';


const entry = [
  'babel-polyfill',
  path.resolve(REPO_ROOT, 'src/index.js'),
];
if (!IS_PROD) {
  entry.unshift(`webpack-dev-server/client?http://${HOST}:${PORT}`);
}

module.exports = {
  mode: IS_PROD ? 'production' : 'development',
  target: 'web',
  devtool: IS_PROD ? 'hidden-source-map' : 'cheap-module-source-map',
  entry,
  output: {
    path: path.join(REPO_ROOT, 'build/dist'),
    filename: 'main.js',
    publicPath: '/',
    // Keep the source map out of the dist directory, to prevent publication.
    sourceMapFilename: IS_PROD ? '../[file].map' : '[file].map',
  },
  resolve: {
    alias: {
    },
    extensions: ['.js', 'json'],
    symlinks: false,
  },
  module: {
    rules: [
      { // ES6.
        test: /\.js$/,
        use: ['babel-loader'],
      },
      { // HTML templates (EJS).
        test: /\.ejs$/,
        use: ['ejs-loader'],
      },
      { // CSS.
        test: /\.css$/,
        use: [
          IS_PROD ? MiniCssExtractPlugin.loader :  'style-loader',
          'css-loader',
          'resolve-url-loader',
        ],
      },
      { // Fonts.
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader'],
      },
      { // Ico files (favicon).
        test: /\.ico$/,
        use: ['file-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(!IS_PROD),
      __PROD__: JSON.stringify(IS_PROD),
      __BUILD__: JSON.stringify(process.env.NODE_ENV),
      __TITLE__: JSON.stringify(title),
      'process.env': JSON.stringify({
        // Including this supposedly reduces the size of node modules.
        NODE_ENV: process.env.NODE_ENV,
      }),
    }),
    new OptimizeCssAssetsPlugin({
    }),
    new HtmlWebPackPlugin({
      title,
      template: "./src/ejs/index.ejs",
      filename: "./index.html",
      isProd: IS_PROD,
      minify: IS_PROD && {
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        quoteCharacter: '"',
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
  ],
  externals: IS_PROD ? {phaser: 'Phaser'} : {},
  stats: {
    chunks: true,
    assetsSort: 'size',
  },
};
