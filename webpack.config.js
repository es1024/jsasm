var path = require('path');
var webpack = require('webpack');

var excludeRegex = /node_modules/;
var config = {
    cache: true,
    entry: {
      'bundle': ['./build/src/index.js'],
    },
    output: {
        path: path.resolve(__dirname, "build", "src"),
        filename: "[name].js"
    },
    devtool: 'source-map',
    resolve: {
        alias: {
        }
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: excludeRegex
            },
        ]
    }
};

module.exports = config;
