var webpack = require('webpack'),
    dotenv = require('dotenv'),
    path = require('path'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    projectRoot = process.env.PWD

var env = dotenv.load({path: `./.env.${process.env.NODE_ENV}`}),
    defineParams = { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
    devMode = process.env.NODE_ENV == "development"

for (k in env) defineParams[k] = JSON.stringify(env[k]);

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({"process.env": defineParams}),
  // new ExtractTextPlugin({filename: "application.css", allChunks: true}),
  new webpack.optimize.UglifyJsPlugin({
    disable: devMode,
    output: {comments: false},
    compress: {
      sequences: true,
      dead_code: true,
      conditionals: true,
      booleans: true,
      unused: true,
      if_return: true,
      join_vars: true,
      drop_console: true,
      drop_debugger: true,
      warnings: false
    }
 })
];

var presets = ['es2015', 'react', 'stage-2'];

if(devMode && process.env._.indexOf("webpack-dev-server") > -1){
  presets.push("react-hmre")
}

module.exports =  {
  devtool: 'eval',
  output: { filename: '[name].js', publicPath: "http://localhost:8080/"},
  module: {
    // preLoaders: [{
    //   test: /\.s[ac]ss/,
    //   loader: 'import-glob-loader'
    // }],
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'react-hot',
          'babel?' + JSON.stringify({ presets: presets, plugins: ["transform-function-bind"] })
        ]
      }
      // ,{
      //   test: /\.s[ca]ss$/,
      //   exclude: /node_modules/,
      //   loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
      // }
    ]
  },
  entry: {
    "index": [
      'webpack/hot/only-dev-server',
      "./src/index.js"
    ],
    "head": "./src/head.js"
  },
  resolve: { root: path.join(projectRoot, "src"), modulesDirectories: [path.join(projectRoot,"node_modules")] },
  plugins: plugins,
  devServer: {
    historyApiFallback: true,
    headers: {
      // "Content-Security-Policy": "default-src 'none'; script-src http://localhost:8080 https://use.typekit.net; style-src http://localhost:3000; img-src http://localhost:3000; connect-src http://localhost:3000 http://localhost:8080 ws://localhost:8080; child-src 'self'"
    }
  }
};


