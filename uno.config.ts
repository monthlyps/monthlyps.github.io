import { defineConfig, presetTypography, presetUno } from "unocss"

export default defineConfig({
  presets: [presetUno(), presetTypography()],
  shortcuts: {
    "rank-1": "font-bold text-amber-5",
    "rank-2": "font-bold text-bluegray-6 dark:text-muted",
    "rank-3": "font-bold text-amber-7",
    "theme-table":
      "w-full [&_thead]:text-gray-4 [&_tr]:b-b [&_tr]:b-light-9 [&_td]:py-4 [&_td]:px-1 [&_td:first-child]:pl-2 dark:[&_tr]:b-dark-3 [&_tr]:transition [&_tr]:transition-property-[background-color] hover:[&_tr]:bg-light-3 hover:dark:[&_tr]:bg-dark-6",
    hover: "transition-transform hover:translate-y-[-0.25rem]",
    "b-border": "b-light-9 dark:b-dark-3",
    "text-muted": "text-gray-4",
  },
  theme: {
    fontFamily: {
      sans: 'Inter, "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
    },
  },
})
