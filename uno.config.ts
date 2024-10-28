import { defineConfig, presetUno } from "unocss"

export default defineConfig({
  presets: [presetUno()],
  theme: {
    fontFamily: {
      sans: 'Inter, "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
    },
  },
})
