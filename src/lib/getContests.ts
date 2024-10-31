import { getCollection, getEntry } from "astro:content"

export async function getSortedContests() {
  const contests = await getCollection("contests")
  contests.sort(
    ({ data: data1 }, { data: data2 }) => -data1.date.localeCompare(data2.date),
  )
  return contests
}

export async function getContestsWithAuthors() {
  const contests = await getCollection("contests")
  for (const contest of contests) {
    const authors = await getEntry("authors", contest.id)
    if (!authors || authors.data.length !== contest.data.problems.length) {
      continue
    }
    for (let i = 0; i < contest.data.problems.length; i++) {
      const problem = contest.data.problems[i]
      const author = authors.data[i]
      contest.data.problems[i] = { ...problem, author }
    }
  }
  return contests
}
