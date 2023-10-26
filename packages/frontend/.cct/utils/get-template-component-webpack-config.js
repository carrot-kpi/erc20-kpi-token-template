import { dirname, join } from "path";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { createHash } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

const require = createRequire(import.meta.url);
const shared = require("@carrot-kpi/host-frontend/shared-dependencies.json");

const hash = createHash("sha256");
hash.update(Date.now().toString());

const UNIQUE_ID = `carrot-template-${hash.digest("hex").slice(0, 32)}`;

const TYPES = ["page", "creationForm"];
const MODES = ["prod", "dev", "playground"];

export const getTemplateComponentWebpackConfig = (
    type,
    globals,
    outDir,
    mode,
) => {
    if (!TYPES.includes(type))
        throw new Error("invalid type, must be on of:", TYPES.join(", "));

    if (!MODES.includes(mode))
        throw new Error("invalid mode, must be one of:", MODES.join(", "));

    const prodMode = mode === "prod";
    return {
        mode: !!prodMode ? "production" : "development",
        target: "browserslist",
        devtool: !!prodMode ? false : "source-map",
        infrastructureLogging: !!prodMode
            ? undefined
            : {
                  level: "none",
              },
        stats: !!prodMode ? undefined : "none",
        entry: join(__dirname, "../../src"),
        output: {
            publicPath: "auto",
            clean: false,
            ...(!!outDir ? { path: outDir } : {}),
            uniqueName: UNIQUE_ID,
        },
        resolve: {
            fallback: !!prodMode
                ? undefined
                : {
                      buffer: join(__dirname, "./utils/buffer.js"),
                  },
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
                                postcssOptions: {
                                    plugins: {
                                        tailwindcss: {},
                                        autoprefixer: {},
                                        "postcss-prefix-selector": {
                                            prefix: `#${UNIQUE_ID}`,
                                        },
                                        ...(process.env.NODE_ENV ===
                                        "production"
                                            ? { cssnano: {} }
                                            : {}),
                                    },
                                },
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
            minimize: !!prodMode,
        },
        plugins: [
            // TODO: further globals might be passed by carrot-scripts??
            new webpack.DefinePlugin({
                ...globals,
                __ROOT_ID__: JSON.stringify(UNIQUE_ID),
                __PLAYGROUND__: JSON.stringify(mode === "playground"),
            }),
            new MiniCssExtractPlugin(),
            new webpack.container.ModuleFederationPlugin({
                name: type,
                filename: `${type}/remoteEntry.js`,
                exposes: {
                    "./component": join(
                        __dirname,
                        `./${
                            type === "page" ? "page" : "creation-form"
                        }-wrapper.tsx`,
                    ),
                    "./i18n": join(
                        __dirname,
                        `../../src/${
                            type === "page" ? "page" : "creation-form"
                        }/i18n/index.ts`,
                    ),
                },
                shared,
            }),
        ],
    };
};
