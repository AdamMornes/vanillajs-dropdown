var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var path  = require('path');

module.exports = {
    mode: 'production',
    entry: './index.js',
    output: {
        filename: 'vjs-dropdown.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    performance: {
        hints: false
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: false,
                extractComments: true,
                uglifyOptions: {
                    warnings: false,
                    mangle: {
                        reserved: ['$super', 'exports', 'require']
                    }
                }
            })
        ]
    }
};