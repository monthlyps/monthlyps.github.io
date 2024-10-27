import { getCollection } from "astro:content"

export async function getSortedContests() {
  const contests = await getCollection("contests")
  contests.sort(
    ({ data: data1 }, { data: data2 }) => -data1.date.localeCompare(data2.date),
  )
  return contests
}
