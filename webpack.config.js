const path = require('path');

module.exports = {
    entry: './src/date-picker.js',
    output: {
        filename: 'dist/date-picker.js'
    },
    devtool: 'eval-source-map',
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }, {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                    }
                }
            }
        ]
    }
};