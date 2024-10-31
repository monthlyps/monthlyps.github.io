import { getCollection, type InferEntrySchema } from "astro:content"

export async function getSortedContests() {
  const contests = await getContests()
  contests.sort(
    ({ data: data1 }, { data: data2 }) => -data1.date.localeCompare(data2.date),
  )
  return contests
}

export async function getContests() {
  const contests = await getCollection("contests")
  const contestsMetadata = await getCollection("contestsMetadata")
  return contests.map(({ id, data }) => {
    return {
      id,
      data: {
        ...data,
        ...contestsMetadata.find(({ id: metaId }) => metaId === id)!.data,
      },
    }
  })
}

export type Contest = InferEntrySchema<"contests"> &
  InferEntrySchema<"contestsMetadata">
