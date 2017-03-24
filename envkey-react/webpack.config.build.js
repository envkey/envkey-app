var webpack = require('webpack'),
    dotenv = require('dotenv'),
    path = require('path'),
    projectRoot = process.env.PWD

var isProd = process.env.PRODUCTION_BUILD == "true",
    isDemo = process.env.DEMO_BUILD == "true",
    buildEnv = isProd ? "production" : (isDemo ? "demo" : "staging"),
    env = dotenv.load({path: `./.env.${buildEnv}`}),
    defineParams = { NODE_ENV: JSON.stringify(process.env.NODE_ENV), BUILD_ENV: JSON.stringify(buildEnv) }

console.log("buildEnv: ", buildEnv)

for (k in env) defineParams[k] = JSON.stringify(env[k]);

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({"process.env": defineParams}),
  new webpack.optimize.UglifyJsPlugin({
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

module.exports =  {
  output: { filename: '[name].js', path: path.resolve("./build")},
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'babel?' + JSON.stringify({ presets: presets, plugins: ["transform-function-bind"] })
        ]
      }
    ]
  },
  entry: {
    "index": "./src/index.js",
    "head": "./src/head.js"
  },
  resolve: { root: path.resolve("./src"), modulesDirectories: [path.resolve("./node_modules")] },
  plugins: plugins
};


