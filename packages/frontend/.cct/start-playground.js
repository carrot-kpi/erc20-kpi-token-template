import chalk from 'chalk'
import { formatWebpackMessages } from './utils/format-webpack-messages.js'
import WebpackDevServer from 'webpack-dev-server'
import webpack from 'webpack'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

const printInstructions = (writableStream, globals, extra) => {
  let printable =
    'Playground frontend available at:\n\n  http://localhost:9000\n\n' +
    'Globals available:\n\n' +
    Object.entries(globals).reduce((accumulator, [key, value]) => {
      accumulator += `  ${key}: ${value}\n`
      return accumulator
    }, '')
  if (extra) printable += `\n ${extra}`
  writableStream.write(printable)
}

export const startPlayground = async (
  forkedNetworkChainId,
  templateId,
  secretKey,
  globals,
  writableStream
) => {
  return new Promise((resolve, reject) => {
    const compiler = webpack({
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
        rules: [{ test: /\.tsx?$/, use: 'ts-loader' }],
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: join(__dirname, '../playground/index.html'),
        }),
        new webpack.DefinePlugin(globals),
        new webpack.container.ModuleFederationPlugin({
          name: 'host',
          shared: { 
            '@carrot-kpi/react': '^0.12.0',
            '@carrot-kpi/sdk': '^1.7.0',
            '@emotion/react': '^11.10.4',
            ethers: '^5.7.1',
            react: { requiredVersion: '^18.2.0', singleton: true },
            'react-dom': { requiredVersion: '^18.2.0', singleton: true },
            wagmi: '^0.7.7',
          },
        }),
      ],
    })

    let firstCompilation = true

    compiler.hooks.invalid.tap('invalid', () => {
      if (!firstCompilation)
        printInstructions(writableStream, globals, 'Compiling playground...')
    })

    const devServer = new WebpackDevServer(
      {
        port: 9000,
        open: true,
        compress: true,
      },
      compiler
    )
    devServer.startCallback((error) => {
      if (error) reject(error)
    })

    compiler.hooks.done.tap('done', async (stats) => {
      if (firstCompilation) {
        resolve()
        firstCompilation = false
      }

      const statsData = stats.toJson({
        all: false,
        warnings: true,
        errors: true,
      })

      const messages = formatWebpackMessages(statsData)
      const isSuccessful = !messages.errors.length && !messages.warnings.length
      if (isSuccessful) {
        printInstructions(writableStream, globals)
      } else if (messages.errors.length) {
        if (messages.errors.length > 1) messages.errors.length = 1
        printInstructions(
          writableStream,
          globals,
          `Failed to compile playground.\n${messages.errors.join('\n\n')}`
        )
      } else if (messages.warnings.length)
        printInstructions(
          writableStream,
          globals,
          chalk.yellow(
            `Playground compiled with warnings:\n${messages.warnings.join(
              '\n\n'
            )}`
          )
        )
    })
  })
}
