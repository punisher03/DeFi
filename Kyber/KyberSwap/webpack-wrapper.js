
const path = require('path');
//const webpack = require('webpack');
//const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// const CompressionPlugin = require('compression-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('./webpack-shell-plugin');
//const ThemesGeneratorPlugin = require('themes-switch/ThemesGeneratorPlugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");


//const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin')

var BLOCKCHAIN_INFO = require("./env")
const fetch = require("node-fetch");
var fs = require('fs');
var sass = require('node-sass');

var getConfig = env => {
    const outputPath = `dist/${env}`

    const timestamp = Date.now();

    let entry = {
        app: ['babel-polyfill', path.resolve(__dirname, 'src/js/client.js'), path.resolve(__dirname, 'src/assets/css/app.scss')]
    };
    let plugins = [
        new webpack.ProgressPlugin(),
        new HtmlWebpackPlugin({
            title: 'Wallet - kyber.network',
            filename: 'index.html',
            template: './app.html',
            favicon: './assets/img/favicon.png',
            inject: 'body'
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),   
        new CleanPlugin([outputPath + '/app.*', outputPath + '/libary.*']),
        new webpack.DefinePlugin({
            'env': JSON.stringify(env),
            'process.env': {
                'logger': env === 'production' || env === 'staging'?'false': 'true',
                'env': JSON.stringify(env)
            }
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/
        })
    ];
    return {
        context: path.join(__dirname, 'src'),
        devtool: 'false',
        mode: 'production',
        entry: entry,
        optimization: {
            // splitChunks: {
            //     chunks: 'all'
            // },
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        compress: {
                            drop_console: true,
                            warnings: false
                        }
                    }
                }),
                new OptimizeCSSAssetsPlugin({})

            ]
        },
        output: {
            path: path.join(__dirname, outputPath),
            filename: `[name].min.js?v=${timestamp}`,
            publicPath: ''
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['react', 'es2015', 'stage-0'],
                        plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
                    }
                },
                {
                    test: /\.(css|sass|scss)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 2,
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                },
                {
                    test: /\.(jpe?g|png|gif|svg|ttf)$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 10000
                            }
                        }
                    ]
                }
            ]
        },
        plugins: plugins
    }
};

async function getTokenApi(network) {
    var BLOCKCHAIN_INFO = require('./env/config-env/' + (network) + ".json");
    return new Promise((resolve, result) => {
        fetch(BLOCKCHAIN_INFO.api_tokens, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        }).then((response) => {
            return response.json()
        })
            .then((result) => {
                let tokens = BLOCKCHAIN_INFO.tokens;
                if (result.success) {
                    tokens = {};
                    result.data.map(val => {
                        tokens[val.symbol] = val
                    })
                }
                resolve(tokens)
            }).catch((err) => {
                console.log(err)
                var tokens = BLOCKCHAIN_INFO.tokens
                resolve(tokens)
            })
    })

}



var webpack = require('webpack');


async function saveBackupTokens(chain) {
    var file = "./env/config-env/" + chain + ".json"
    var obj = JSON.parse(fs.readFileSync(file, 'utf8'));

    var tokens = {
      "ETH": {
          "symbol": "ETH",
          "name": "Ethereum",
          "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          "decimals": 18,
          "cg_id": "ethereum",
          "gasLimit": "0",
          "sp_limit_order": true,
          "is_quote": true
      },
      "WETH": {
          "symbol": "WETH",
          "name": "Wrapped Ether",
          "address": "0x494dE9b08140206f1931A84098e84DBB195ce595",
          "decimals": 18,
          "cg_id": "weth",
          "priority": true,
          "sp_limit_order": true,
          "is_quote": true
      },
      "KNC": {
          "symbol": "KNC",
          "name": "KyberNetwork",
          "address": "0x5903820acD03cCadaDD36709D7c6B457247e23b7",
          "decimals": 18,
          "cg_id": "kyber-network",
          "priority": true,
          "sp_limit_order": true
      },
      "DAI": {
          "symbol": "DAI",
          "name": "DAI",
          "address": "0x277aa793a197683D2f713bd29f0eD9FeA4aC1248",
          "decimals": 18,
          "cg_id": "dai",
          "gasLimit": "500000",
          "priority": true,
          "sp_limit_order": true,
          "is_quote": true
      },
      "OMG": {
          "symbol": "OMG",
          "name": "OmiseGO",
          "address": "0x414a66178E0CC0dE816d1E87C4d0F6C066a29612",
          "decimals": 18,
          "cg_id": "omisego",
          "priority": true,
          "sp_limit_order": true
      },
      "POLY": {
          "symbol": "POLY",
          "name": "Polymath",
          "address": "0x565c71686f4Ee595FB2aE9088173b43ca36701B7",
          "decimals": 18,
          "cg_id": "polymath-network"
      },
      "SNT": {
          "symbol": "SNT",
          "name": "Status",
          "address": "0x29CB4f4b7d7eDA073751FA8927e92B7baEE44A8B",
          "decimals": 18,
          "cg_id": "status",
          "sp_limit_order": true
      },
      "MANA": {
          "symbol": "MANA",
          "name": "Mana",
          "address": "0xF093d7B35a4cD3cB67ecAF392A2FddEBede13365",
          "decimals": 18,
          "cg_id": "decentraland",
          "priority": true,
          "sp_limit_order": true
      }
    }
    obj.tokens = tokens

    fs.writeFileSync(file, JSON.stringify(obj, null, 4));
}

async function renderLanguage(){
    var yaml = require('yamljs');
    const railsPath = '../config/locales/views/'
    const langPath = './lang/'

    var processFile = function(fileName, callback){
    try {
        var json = yaml.parse(
        fs.readFileSync(
            railsPath + fileName
        , 'utf8'));
        var rawName = fileName.split('.')[0]
        fs.writeFile(langPath + rawName + '.json', JSON.stringify(json[rawName].kyber_swap, null, 2), 'utf8', callback);
    } catch (e) {
        console.log(e);
    }
    }

    try {
    var list = fs.readdirSync(railsPath)
    list.forEach(file => {
        processFile(file, (err) => {
        if(!err) console.log(`process file ${file} without error`)
        })
    })
    } catch (error) {
    
    }

}
async function main() {
    //render language
   // await renderLanguage()

    var enviroment = process.env.NODE_ENV

    await saveBackupTokens(enviroment)

    var webpackConfig = await getConfig(enviroment)  

    var compiler = await webpack(webpackConfig)
    compiler.run(function (err, stats) {
        if (!err) {
            console.log("success")
        } else {
            console.log("fail")
            console.log(err)
        }
    })
}

main()