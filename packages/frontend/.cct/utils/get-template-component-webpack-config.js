import { dirname, join } from "path";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import postcssOptions from "../../postcss.config.js";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));

const require = createRequire(import.meta.url);
const shared = require("@carrot-kpi/frontend/shared-dependencies.json");

export const getTemplateComponentWebpackConfig = (
    uniqueName,
    componentPath,
    i18nPath,
    globals,
    outDir
) => {
    const devMode = !!!outDir;
    return {
        mode: devMode ? "development" : "production",
        devtool: false,
        infrastructureLogging: devMode
            ? {
                  level: "none",
              }
            : undefined,
        stats: devMode ? "none" : undefined,
        entry: join(__dirname, "../../src"),
        output: {
            clean: true,
            path: outDir,
            uniqueName,
        },
        resolve: {
            fallback: devMode
                ? {
                      buffer: join(__dirname, "./utils/buffer.js"),
                  }
                : undefined,
            extensions: [".ts", ".tsx", "..."],
        },
        module: {
            rules: [
                { test: /\.tsx?$/, use: "ts-loader" },
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions,
                            },
                        },
                    ],
                },
                {
                    test: /\.svg/,
                    use: [
                        {
                            loader: "@svgr/webpack",
                            options: {
                                prettier: false,
                                svgoConfig: {
                                    plugins: [
                                        {
                                            name: "preset-default",
                                            params: {
                                                overrides: {
                                                    removeViewBox: false,
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        "url-loader",
                    ],
                },
            ],
        },
        optimization: {
            minimize: !!!devMode,
        },
        plugins: [
            // TODO: further globals might be passed by carrot-scripts??
            new webpack.DefinePlugin({
                ...globals,
                __DEV__: devMode ? JSON.stringify(true) : JSON.stringify(false),
            }),
            new MiniCssExtractPlugin(),
            new webpack.container.ModuleFederationPlugin({
                name: "remoteEntry",
                library: {
                    type: "window",
                    name: uniqueName,
                },
                exposes: {
                    "./component": componentPath,
                    "./i18n": i18nPath,
                },
                shared,
            }),
        ],
    };
};
