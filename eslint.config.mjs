import eslint from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import tseslint from "typescript-eslint"

export default [
  ...tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
  ),
  eslintConfigPrettier,
  {
    files: ["tests/**/*.mjs"],
    languageOptions: {
      globals: {
        URL: "readonly",
      },
    },
  },
  {
    ignores: [".astro", "dist", "public/problem-assets/**"],
  },
]
