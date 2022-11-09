import WebpackDevServer from 'webpack-dev-server'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { long as longCommitHash } from 'git-rev-sync'
import { join } from 'path'
import webpack from 'webpack'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

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
    entry: join(__dirname, '../playground/core/index.tsx'),
    resolve: {
      extensions: ['.ts', '.tsx', '...'],
    },
    module: {
      rules: [{ test: /\.tsx?$/, use: 'ts-loader' }],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: join(__dirname, '../playground/core/index.html'),
      }),
      new webpack.DefinePlugin(globals),
      new webpack.container.ModuleFederationPlugin({
        name: 'host',
        shared: {
          '@carrot-kpi/react': '^0.13.0',
          '@carrot-kpi/sdk': '^1.9.0',
          '@emotion/react': '^11.10.4',
          ethers: '^5.7.1',
          react: { requiredVersion: '^18.2.0', singleton: true },
          'react-dom': { requiredVersion: '^18.2.0', singleton: true },
          wagmi: '^0.7.7',
        },
      }),
    ],
  })
  const templateApplicationCompiler = webpack({
    mode: 'development',
    infrastructureLogging: {
      level: 'none',
    },
    stats: 'none',
    entry: join(__dirname, '../playground/template/index.tsx'),
    resolve: {
      extensions: ['.ts', '.tsx', '...'],
    },
    module: {
      rules: [{ test: /\.tsx?$/, use: 'ts-loader' }],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: join(__dirname, '../playground/template/index.html'),
      }),
      new webpack.DefinePlugin(globals),
      new webpack.container.ModuleFederationPlugin({
        name: `${commitHash}creationForm`,
        library: { type: 'window', name: `${commitHash}creationForm` },
        exposes: {
          './component': join(__dirname, '../src/creation-form/index.tsx'),
          './i18n': join(__dirname, '../src/creation-form/i18n/index.ts'),
          './set-public-path': join(__dirname, '../src/set-public-path.ts'),
        },
        shared: {
          '@carrot-kpi/react': '^0.13.0',
          '@carrot-kpi/sdk': '^1.9.0',
          ethers: '^5.7.1',
          react: { requiredVersion: '^18.2.0', singleton: true },
          'react-dom': { requiredVersion: '^18.2.0', singleton: true },
          wagmi: '^0.7.7',
        },
      }),
      new webpack.container.ModuleFederationPlugin({
        name: `${commitHash}page`,
        library: { type: 'window', name: `${commitHash}page` },
        exposes: {
          './component': join(__dirname, '../src/page/index.tsx'),
          './i18n': join(__dirname, '../src/page/i18n/index.ts'),
          './set-public-path': join(__dirname, '../src/set-public-path.ts'),
        },
        shared: {
          '@carrot-kpi/react': '^0.13.0',
          '@carrot-kpi/sdk': '^1.9.0',
          ethers: '^5.7.1',
          react: { requiredVersion: '^18.2.0', singleton: true },
          'react-dom': { requiredVersion: '^18.2.0', singleton: true },
          wagmi: '^0.7.7',
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
      port: 3000,
      open: true,
      compress: true,
    },
    coreApplicationCompiler
  )
  const templateApplicationDevServer = new WebpackDevServer(
    {
      port: 3001,
      open: true,
      compress: true,
    },
    templateApplicationCompiler
  )

  // run the applications
  await coreApplicationDevServer.start()
  await templateApplicationDevServer.start()

  // wait for the applications to be fully started
  await Promise.all([coreCompilerPromise, templateCompilerPromise])
}
