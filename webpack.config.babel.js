/* eslint-env node */
import {resolve} from "path";
import pkg from "./package.json";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import LessPluginAutoprefix from 'less-plugin-autoprefix';

let entries = {
    [pkg.name]: resolve(__dirname, pkg.directories.client, 'js/main.js')
};


function buildBanner() {
    return `${ pkg.title || pkg.name } - v${ pkg.version } - ${ getDate() }\n` +
        (pkg.homepage ? `${pkg.homepage}\\n` : "") +
        `Copyright (c) ${ getYear() } ${ pkg.author.name || pkg.author }\n` +
        `Licensed ${ pkg.license }\n`;
}

function getDate(date = new Date()) {
    return `${date.getFullYear()}-${leftPad(date.getMonth(), 0, 2)}-${leftPad(date.getDate(), 0, 2)}`;
}

function getYear(date = new Date()) {
    return `${date.getFullYear()}`;
}

function leftPad(text, value, count = 0) {
    let res = "" + text;

    for (let i = res.length; i < count; i++) {
        res = value + res;
    }

    return res;
}

function toCamelCase(str) {
    return str.replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase();
    });
}

function toDromedaryCase(str) {
    if (!str.length) {
        return str;
    }

    let res = toCamelCase(str);

    return res[0].toUpperCase() + res.substr(1);
}


export default {
    entry: entries,
    output: {
        path: resolve(__dirname, pkg.directories.public),
        filename: '[name].js',
        library: {
            root: `${toDromedaryCase(pkg.name)}`,
            amd: "[name]",
            commonjs: "[name]"
        },
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                // modules: true,
                                importLoaders: 1,
                                sourceMap: true
                            }
                        }
                    ]
                })
            },
            {
                test: /\.less/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                // modules: true,
                                importLoaders: 1,
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'less-loader',
                            options: {
                                sourceMap: true,
                                plugins: [
                                    new LessPluginAutoprefix(
                                        pkg.babel.presets[0][1] // FIXME: this is ugly
                                    )
                                ]
                            }
                        }
                    ]
                })
            },
            {
                test: /\.modernizrrc$/,
                use: [ 'modernizr-loader', 'json-loader' ]
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            modernizr$: resolve(__dirname, ".modernizrrc")
        }

    },
    devtool: "source-map",
    plugins: [
        new webpack.BannerPlugin({
            entryOnly: true,
            banner: buildBanner()
        }),
        new ExtractTextPlugin({
            ignoreOrder: true,
            filename: "styles.css"
        }),
        new HtmlWebpackPlugin({
            title: '+Ramboia',
            filename: 'index.html',
            template: resolve(__dirname, pkg.directories.client, 'index.ejs'),
            hash: true
        })
    ]
};
