const { join } = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        join(__dirname, "./playground/**/*.{js,jsx,ts,tsx}"),
        join(__dirname, "./src/**/*.{js,jsx,ts,tsx}"),
    ],
    presets: [require("@carrot-kpi/ui/tailwind-preset")],
    theme: {
        extend: {
            gridTemplateColumns: {
                rewards: "1.8fr 1fr 1fr",
                rewardsNoMinimumPayout: "1.8fr 1fr",
            },
        },
    },
    corePlugins: {
        preflight: false,
    },
};
