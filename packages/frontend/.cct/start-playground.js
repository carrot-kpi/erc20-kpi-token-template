import WebpackDevServer from 'webpack-dev-server'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { long as longCommitHash } from 'git-rev-sync'
import { join } from 'path'
import webpack from 'webpack'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

import { setupCompiler } from './setup-compiler.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const startPlayground = async (
  forkedNetworkChainId,
  templateId,
  secretKey,
  globals,
  writableStream
) => {
  let coreFirstCompilation = true
  let templateFirstCompilation = true

  const commitHash = longCommitHash(join(__dirname, '../'))

  // initialize the applications compiler
  const coreApplicationCompiler = webpack({
    mode: 'development',
    infrastructureLogging: {
      level: 'none',
    },
    stats: 'none',
    entry: join(__dirname, '../playground/index.tsx'),
    resolve: {
      extensions: ['.ts', '.tsx', '...'],
    },
    module: {
      rules: [
        { test: /\.tsx?$/, use: 'ts-loader' },
        {
          test: /\.css$/i,
          include: join(__dirname, '../playground'),
          exclude: /node_modules/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    tailwindcss({
                      config: {
                        content: ['../playground/**/*.{js,jsx,ts,tsx}'],
                      },
                    }),
                    autoprefixer,
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: join(__dirname, '../playground/index.html'),
      }),
      new MiniCssExtractPlugin({
        filename: '[name].bundle.css',
        chunkFilename: '[id].css',
      }),
      new webpack.DefinePlugin(globals),
      new webpack.container.ModuleFederationPlugin({
        name: 'host',
        shared: {
          '@carrot-kpi/react': '^0.16.0',
          '@carrot-kpi/sdk': '^1.9.2',
          '@emotion/react': '^11.10.4',
          ethers: '^5.7.1',
          react: { requiredVersion: '^18.2.0', singleton: true },
          'react-dom': { requiredVersion: '^18.2.0', singleton: true },
          wagmi: '^0.8.5',
        },
      }),
    ],
  })
  const templateApplicationCompiler = webpack({
    mode: 'development',
    infrastructureLogging: {
      level: 'none',
    },
    entry: {
      creationForm: join(__dirname, '../src/set-public-path.ts'),
      page: join(__dirname, '../src/set-public-path.ts'),
    },
    stats: 'none',
    resolve: {
      extensions: ['.ts', '.tsx', '...'],
    },
    module: {
      rules: [
        { test: /\.tsx?$/, use: 'ts-loader' },
        {
          test: /\.css$/i,
          include: join(__dirname, '../src'),
          exclude: /node_modules/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    tailwindcss({
                      config: {
                        content: ['../src/**/*.{js,jsx,ts,tsx}'],
                      },
                    }),
                    autoprefixer,
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].bundle.css',
        chunkFilename: '[id].css',
      }),
      new webpack.DefinePlugin(globals),
      new webpack.container.ModuleFederationPlugin({
        name: 'creationForm',
        library: { type: 'window', name: `creationForm` },
        exposes: {
          './component': join(__dirname, '../src/creation-form/index.tsx'),
          './i18n': join(__dirname, '../src/creation-form/i18n/index.ts'),
          './set-public-path': join(__dirname, '../src/set-public-path.ts'),
        },
        shared: {
          '@carrot-kpi/react': '^0.16.0',
          '@carrot-kpi/sdk': '^1.9.2',
          ethers: '^5.7.1',
          react: { requiredVersion: '^18.2.0', singleton: true },
          'react-dom': { requiredVersion: '^18.2.0', singleton: true },
          wagmi: '^0.8.5',
        },
      }),
      new webpack.container.ModuleFederationPlugin({
        name: 'page',
        library: { type: 'window', name: `page` },
        exposes: {
          './component': join(__dirname, '../src/page/index.tsx'),
          './i18n': join(__dirname, '../src/page/i18n/index.ts'),
          './set-public-path': join(__dirname, '../src/set-public-path.ts'),
        },
        shared: {
          '@carrot-kpi/react': '^0.16.0',
          '@carrot-kpi/sdk': '^1.9.2',
          ethers: '^5.7.1',
          react: { requiredVersion: '^18.2.0', singleton: true },
          'react-dom': { requiredVersion: '^18.2.0', singleton: true },
          wagmi: '^0.8.5',
        },
      }),
    ],
  })

  // setup the applications compilers hooks
  const coreCompilerPromise = setupCompiler(
    coreApplicationCompiler,
    globals,
    writableStream,
    coreFirstCompilation,
    'CORE'
  )
  const templateCompilerPromise = setupCompiler(
    templateApplicationCompiler,
    globals,
    writableStream,
    templateFirstCompilation,
    'TEMPLATE'
  )

  // initialize the webpack dev servers
  const coreApplicationDevServer = new WebpackDevServer(
    {
      port: 9000,
      open: true,
      compress: true,
    },
    coreApplicationCompiler
  )
  const templateApplicationDevServer = new WebpackDevServer(
    {
      port: 9002,
      open: false,
      compress: true,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:9000',
      },
    },
    templateApplicationCompiler
  )

  // run the applications
  await coreApplicationDevServer.start()
  await templateApplicationDevServer.start()

  // wait for the applications to be fully started
  await Promise.all([coreCompilerPromise, templateCompilerPromise])
}
