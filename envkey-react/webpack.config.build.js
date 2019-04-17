var webpack = require('webpack'),
    path = require('path'),
    EnvkeyWebpackPlugin = require('envkey-webpack-plugin')

var isProd = process.env.PRODUCTION_BUILD == "true",
    isDemo = process.env.DEMO_BUILD == "true",
    isK8s = process.env.K8S_BUILD == "true",
    debugBuild = process.env.DEBUG_BUILD == "true",
    buildEnv

if (isProd){
  buildEnv = "production"
} else if (isDemo){
  buildEnv = "demo"
} else if (isK8s){
  buildEnv = "k8s-production"
} else {
  buildEnv = "staging"
}

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new EnvkeyWebpackPlugin({
    dotEnvFile: `.env.${buildEnv}`,
    permitted: ["HOST", "PUSHER_APP_KEY", "STRIPE_PUBLISHABLE_KEY"],
    define: {
      NODE_ENV: "production",
      BUILD_ENV: buildEnv,
      API_HOST: process.env.API_HOST,
      ASSET_HOST: process.env.ASSET_HOST || "",
      DEBUG_BUILD: debugBuild || undefined
    }
  })
];

if (!debugBuild){
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    output: {comments: false},
    compress: {
      sequences: true,
      dead_code: true,
      conditionals: true,
      booleans: true,
      unused: true,
      if_return: true,
      join_vars: true,
      drop_console: false,
      drop_debugger: true,
      warnings: false
    }
  }))
}


var presets = ['es2015', 'react', 'stage-2'];

module.exports =  {
  output: { filename: '[name].js', path: path.resolve("./build")},
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
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
    "stripe_card": "./src/stripe_card.js",
    "main_updater": "./src/main_updater.js"
  },
  resolve: { root: path.resolve("./src"), modulesDirectories: [path.resolve("./node_modules")] },
  plugins: plugins
};


