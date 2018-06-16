var webpack = require('webpack'),
    path = require('path'),
    EnvkeyWebpackPlugin = require('envkey-webpack-plugin'),
    projectRoot = process.env.PWD

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.IgnorePlugin(/openpgp/),
  new webpack.IgnorePlugin(/webworker-threads/),
  new webpack.IgnorePlugin(/^os$/),
  new EnvkeyWebpackPlugin({
    dotEnvFile: '.env.development',
    permitted: ["NODE_ENV","API_HOST", "ASSET_HOST", "HOST", "PUSHER_APP_KEY", "STRIPE_PUBLISHABLE_KEY"],
  })
];

var presets = ['es2015', 'react', 'stage-2', 'react-hmre'];

module.exports =  {
  devtool: 'cheap-source-map',
  output: { filename: '[name].js', publicPath: "http://localhost:8080/"},
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        loaders: [
          'react-hot',
          'babel?' + JSON.stringify({ presets: presets, plugins: ["transform-function-bind"] })
        ]
      }
    ]
  },
  entry: {
    "index": [
      'webpack/hot/only-dev-server',
      "./src/index.js"
    ],
    "stripe_card": "./src/stripe_card.js",
    "main_updater": "./src/main_updater.js"
  },
  resolve: { root: path.resolve("./src"), modulesDirectories: [path.resolve(__dirname,"node_modules"), path.resolve(__dirname,"node_modules", "envkey-client-core", "node_modules")] },
  plugins: plugins,
  devServer: {
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
      // "Content-Security-Policy": "default-src 'none'; script-src http://localhost:8080 https://use.typekit.net; style-src http://localhost:3000; img-src http://localhost:3000; connect-src http://localhost:3000 http://localhost:8080 ws://localhost:8080; child-src 'self'"
    }
  }
};


