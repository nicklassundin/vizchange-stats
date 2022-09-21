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
    node: {
        "child_process": "empty",
        "console": true,
        "fs": "empty",
        "net": "empty",
        "tls": "empty"
    },
    resolve: {
        fallback: {
            https: false
        }
    }
};