import { file, glob } from "astro/loaders"
import { defineCollection, z } from "astro:content"

const contests = defineCollection({
  loader: glob({
    pattern: "*.json",
    base: "./contests/fetched",
  }),
  schema: z.object({
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
    penalty: z.number(),
  }),
})

const contestsMetadata = defineCollection({
  loader: file("./contests/metadata.json"),
  schema: z.object({
    date: z.string(),
    bojId: z.string(),
    authors: z.array(z.string()).optional(),
  }),
})

export const collections = { contests, contestsMetadata }
