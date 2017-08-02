var webpack = require('webpack'),
    envkey = require('envkey/loader'),
    path = require('path'),
    EnvkeyWebpackPlugin = require('envkey-webpack-plugin')

var isProd = process.env.PRODUCTION_BUILD == "true",
    isDemo = process.env.DEMO_BUILD == "true",
    buildEnv = isProd ? "production" : (isDemo ? "demo" : "staging"),

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new EnvkeyWebpackPlugin({
    dotEnvFile: `.env.${buildEnv}`,
    permitted: ["NODE_ENV", "API_HOST", "ASSET_HOST", "HOST", "PUSHER_APP_KEY"],
    define: {BUILD_ENV: buildEnv}
  }),
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


