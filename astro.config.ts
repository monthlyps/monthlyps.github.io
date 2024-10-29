import { defineConfig } from "astro/config"
import UnoCSS from "unocss/astro"

export default defineConfig({
  site: "https://monthlyps.github.io",
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
