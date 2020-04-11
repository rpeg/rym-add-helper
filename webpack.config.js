module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    filename: '[name].js',
    path: `${__dirname}/dist`,
  },
  module: {
    rules: [
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
    extensions: ['.js', '.jsx'],
  },
};
