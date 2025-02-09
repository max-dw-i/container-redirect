const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemarkHTML = require('remark-html');

module.exports = {

  entry: {
    index: './src/index.js',
    'ui/index': ['./src/ui/index.js'],
    'ui-preferences/index': ['./src/ui-preferences/index.js'],
  },

  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: path.resolve(process.cwd(), 'build'),
    publicPath: '/static/',
  },

  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /manifest\.json$/,
        type: 'javascript/auto',
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      },
      {
        test: /icon\.png$/,
        type: 'javascript/auto',
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'icons/[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.html$/,
        type: 'javascript/auto',
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[folder]/[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path]/[name].html',
            },
          },
          {
            loader: 'remark-loader',
            options: {
              remarkOptions: {
                plugins: [RemarkHTML],
              },
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },

  optimization: {
    chunkIds: 'total-size',
    moduleIds: 'size',
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],

};
