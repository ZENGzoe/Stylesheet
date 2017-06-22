const postcssSprites = require('postcss-sprites');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool : "inline-source-map",
    entry : "./src/js/index.js",
    output : {
        path : __dirname + "/dist/js",
        filename : "bundle.js"
    },
    devServer : {
        compress : false,
        contentBase : __dirname,
        publicPath : '/',
        port : 8081
    },
    module : {
        loaders : [
            { 
                test : /\.js|.jsx?$/, 
                loader : 'babel-loader',
                exclude : /node_modules/
            }
        ],
        rules : [
            {
                test : /\.css$/,
                exclude : /dist/,
                use : ExtractTextPlugin.extract({
                    fallback : 'style-loader',
                    use : ['css-loader?module&localIdentName=[local]','postcss-loader']
                })
            },
            {
                test : /\.(jpg|png)$/,
                use : 'file-loader?name=../img/[name].[ext]'
            }
        ]
    },
    plugins : [
        new ExtractTextPlugin("../css/global.css"),
        new HtmlWebpackPlugin({
            title : "postcss生成雪碧图",
            filename : "../index.html",
            template : 'src/index.html'
        })
    ]
}