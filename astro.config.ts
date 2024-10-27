import { defineConfig } from "astro/config"
import UnoCSS from "unocss/astro"

export default defineConfig({
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
  ],
  vite: {
    ssr: {
      noExternal: ["pretendard", "@fontsource/inter"],
    },
  },
})
