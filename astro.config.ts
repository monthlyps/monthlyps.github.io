import { defineConfig } from "astro/config"
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
    ssr: {
      noExternal: ["pretendard", "@fontsource/inter"],
    },
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
})
