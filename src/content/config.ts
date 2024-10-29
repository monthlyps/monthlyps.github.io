import { defineCollection, z } from "astro:content"

import { glob } from "astro/loaders"

const contests = defineCollection({
  loader: glob({
    pattern: "*.json",
    base: "./contests",
  }),
  schema: z.object({
    date: z.string(),
    bojId: z.string(),
    title: z.string(),
    durationSeconds: z.number(),
    participants: z.array(z.string()),
    problems: z.array(
      z.object({
        title: z.string(),
        number: z.string(),
      }),
    ),
    runs: z.array(
      z.object({
        who: z.string(),
        problem: z.string(),
        result: z.enum(["ACCEPTED", "INCORRECT"]),
        submissionMinute: z.number(),
      }),
    ),
    boardType: z.enum(["boj", "spotboard"]),
    penalty: z.number(),
  }),
})

export const collections = { contests }
