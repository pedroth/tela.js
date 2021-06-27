const path = require("path");
const nodeExternals = require("webpack-node-externals");

const baseConfig = {
  mode: "production",
  entry: {
    index: "./src/index.js",
  },
  devtool: "source-map",
  output: {
    path: path.resolve("./dist/"),
    filename: "[name].js",
    library: "Tela",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              "@babel/plugin-proposal-class-properties",
              "@babel/plugin-proposal-private-methods",
              [
                "@babel/plugin-transform-runtime",
                { useESModules: true, helpers: true },
              ],
            ],
          },
        },
      },
    ],
  },
};

const serverConfig = { ...baseConfig };
serverConfig.target = "node";
serverConfig.output = { ...baseConfig.filename };
serverConfig.output.filename = "[name].node.js";
serverConfig.externals = [nodeExternals()];

const clientConfig = { ...baseConfig };
clientConfig.target = "web";
clientConfig.module = { ...baseConfig.module };
clientConfig.module.rules.push(
  {
    test: /\.css$/i,
    use: ["style-loader", "css-loader"],
  },
  {
    test: /\.(woff|woff2)$/,
    use: {
      loader: "url-loader",
    },
  }
);

module.exports = [serverConfig, clientConfig];
