import tailwindPostCssConfig from './tailwind.config.js'

export default {
  plugins: {
    tailwindcss: { config: tailwindPostCssConfig },
    autoprefixer: {},
  },
}
