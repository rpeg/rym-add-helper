const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

const options = {
  mode: 'production',
  entry: path.join(__dirname, 'src', 'main.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        exclude: /node_modules/,
      },
      {
        test: new RegExp(`.(${fileExtensions.join('|')})$`),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/plugin-transform-react-jsx', { pragma: 'h' }],
            ],
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
    },
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin(),
    new WriteFilePlugin(),
  ],
};

module.exports = options;
