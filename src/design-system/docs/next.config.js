const path = require('path');
const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const withPlugins = require('next-compose-plugins');
const createTM = require('next-transpile-modules');
const webpack = require('webpack'); // eslint-disable-line import/no-extraneous-dependencies

const withTM = createTM([
  'react-native-reanimated',
  'react-native-markdown-display',
]);
const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  babelConfigFile: path.resolve('./babel.config.js'),
  experimental: {
    externalDir: true, // https://github.com/vercel/next.js/pull/22867
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: config => {
    config.resolve.modules = [
      path.join(__dirname, './node_modules'),
      'node_modules',
    ];
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: true,
        android: false,
        ios: false,
      })
    );
    return config;
  },
};

module.exports = withPlugins(
  [withVanillaExtract, withReactNativeWeb, withTM],
  nextConfig
);

///////////////////////////////////////////////////////////////////////////

function withReactNativeWeb(nextConfig) {
  return {
    ...nextConfig,
    webpack: (config, options) => {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        // Transform all direct `react-native` imports to `react-native-web`
        'react-native$': 'react-native-web',
      };
      config.resolve.extensions = [
        '.web.js',
        '.web.ts',
        '.web.tsx',
        ...config.resolve.extensions,
      ];

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }
      return config;
    },
  };
}
