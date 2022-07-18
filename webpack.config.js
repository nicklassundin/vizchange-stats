// Const $ = require("jquery");

const webpack = require("webpack");
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './module.js',
    output: {
        path: path.resolve(__dirname, 'client'),
        filename: 'bundle.js',
    },
    resolve: {
        fallback: {
            https: false
        }
    }
};