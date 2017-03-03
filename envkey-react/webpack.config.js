var webpack = require('webpack'),
    dotenv = require('dotenv'),
    path = require('path'),
    projectRoot = process.env.PWD

var env = dotenv.load({path: './.env.development'}),
    defineParams = { NODE_ENV: JSON.stringify(process.env.NODE_ENV) }

for (k in env) defineParams[k] = JSON.stringify(env[k]);

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({"process.env": defineParams}),
];

var presets = ['es2015', 'react', 'stage-2', 'react-hmre'];

module.exports =  {
  devtool: 'eval',
  output: { filename: '[name].js', publicPath: "http://localhost:8080/"},
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
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


