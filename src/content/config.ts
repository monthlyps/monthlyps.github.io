import { defineCollection, z } from "astro:content"

import { glob } from "astro/loaders"

const contests = defineCollection({
  loader: glob({
    pattern: "*.json",
    base: "./contests",
  }),
  schema: z.object({
    date: z.string(),
    top: z.array(
      z.object({
        handle: z.string(),
      }),
    ),
  }),
})

export const collections = { contests }
