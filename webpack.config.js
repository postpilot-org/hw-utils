const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/index.mjs',
  output: {
    path: path.resolve('dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.mjs?$/,
        exclude: /(node_modules)/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
}
