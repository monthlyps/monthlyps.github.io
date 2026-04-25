import { defineConfig } from "astro/config"
import { fileURLToPath } from "node:url"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import UnoCSS from "unocss/astro"

export default defineConfig({
  site: "https://monthlyps.github.io",
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "~": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    ssr: {
      noExternal: ["pretendard", "@fontsource/inter"],
    },
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
})
