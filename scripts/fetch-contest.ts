import { z } from "astro/zod"
import { cac } from "cac"
import * as fs from "node:fs/promises"
import * as path from "node:path"

type FetchData = {
  durationSeconds: number
  title: string
  participants: string[]
  problems: {
    title: string
    number: string
  }[]
  runs: {
    who: string
    problem: string
    result: "ACCEPTED" | "INCORRECT"
    submissionMinute: number
  }[]
  penalty: number
}

const BaseContest = z.object({
  date: z.string(),
  bojId: z.string(),
})

const BojBoardInfo = z.object({
  start: z.number(),
  end: z.number(),
  title: z.string(),
  problems: z.array(
    z.object({
      title: z.string(),
      number: z.string(),
      id: z.number(),
    }),
  ),
  teams: z.array(
    z.object({
      id: z.number(),
      team: z.string(),
    }),
  ),
  penalty: z.string(),
  last_penalty: z.string(),
})

const BojBoardRuns = z.object({
  runs: z.array(
    z.object({
      problem: z.number(),
      result: z.number(),
      team: z.number(),
      time: z.number(),
    }),
  ),
})

const SpotboardInfo = z.object({
  title: z.string(),
  problems: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      title: z.string(),
    }),
  ),
  teams: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
})

const SpotboardRuns = z.object({
  time: z.object({
    contestTime: z.number(),
  }),
  runs: z.array(
    z.object({
      id: z.string(),
      problem: z.number(),
      result: z.string(),
      team: z.string(),
      submissionTime: z.number(),
    }),
  ),
})

const fetchConfig = {
  method: "get",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36",
  },
} satisfies RequestInit

async function fetchBojBoard(id: string): Promise<FetchData | null> {
  const bojInfoRaw = await fetch(
    `https://www.acmicpc.net/contest/board/${id}/info.json`,
    fetchConfig,
  )
  if (!bojInfoRaw.ok) {
    return null
  }
  const bojInfoParse = BojBoardInfo.safeParse(await bojInfoRaw.json())
  if (bojInfoParse.error != null) {
    console.error("failed to parse boj info.json", bojInfoParse.error)
    return null
  }
  const { data: contest } = bojInfoParse
  const bojRunsRaw = await fetch(
    `https://www.acmicpc.net/contest/board/${id}/runs.json`,
    fetchConfig,
  )
  if (!bojRunsRaw.ok) {
    return null
  }
  const bojRunsParse = BojBoardRuns.safeParse(await bojRunsRaw.json())
  if (bojRunsParse.error != null) {
    console.error("failed to parse boj runs.json", bojRunsParse.error)
    return null
  }
  const {
    data: { runs },
  } = bojRunsParse
  return {
    title: contest.title,
    durationSeconds: contest.end - contest.start,
    participants: contest.teams.map(({ team }) => team),
    problems: contest.problems.map(({ title, number }) => ({ title, number })),
    runs: runs.map(({ problem, result, team, time }) => ({
      who: contest.teams.find(({ id }) => id === team)!.team,
      problem: contest.problems.find(({ id }) => id === problem)!.number,
      result: result === 1 ? "ACCEPTED" : "INCORRECT",
      submissionMinute: time,
    })),
    penalty: +contest.penalty,
  }
}

async function fetchSpotboard(id: string): Promise<FetchData | null> {
  const spotboardInfoRaw = await fetch(
    `https://www.acmicpc.net/contest/spotboard/${id}/contest.json`,
    fetchConfig,
  )
  if (!spotboardInfoRaw.ok) {
    return null
  }
  const spotboardInfoParse = SpotboardInfo.safeParse(
    await spotboardInfoRaw.json(),
  )
  if (spotboardInfoParse.error != null) {
    console.error(
      "failed to parse spotboard contest.json",
      spotboardInfoParse.error,
    )
    return null
  }
  const { data: contest } = spotboardInfoParse
  const spotboardRuns = await fetch(
    `https://www.acmicpc.net/contest/spotboard/${id}/runs.json`,
    fetchConfig,
  )
  if (!spotboardRuns.ok) {
    return null
  }
  const spotboardRunsParse = SpotboardRuns.safeParse(await spotboardRuns.json())
  if (spotboardRunsParse.error != null) {
    console.error(
      "failed to parse spotboard runs.json",
      spotboardRunsParse.error,
    )
    return null
  }
  const {
    data: { time, runs },
  } = spotboardRunsParse
  return {
    title: contest.title,
    durationSeconds: time.contestTime,
    participants: contest.teams.map(({ name }) => name.split(" ")[0]),
    problems: contest.problems.map(({ title, name }) => ({
      title,
      number: name,
    })),
    runs: runs.map(({ problem, result, team, submissionTime }) => ({
      who: contest.teams.find(({ id }) => id === team)!.name.split(" ")[0],
      problem: contest.problems.find(({ id }) => id === problem)!.name,
      result: result === "Yes" ? "ACCEPTED" : "INCORRECT",
      submissionMinute: submissionTime,
    })),
    penalty: 20,
  }
}

async function processContestFile(contestFile: string): Promise<void> {
  console.log(`Fetching contest: ${contestFile}`)
  const contestJson = await fs.readFile(contestFile, { encoding: "utf-8" })
  const object = JSON.parse(contestJson)
  const baseContestParse = BaseContest.safeParse(object)
  if (baseContestParse.error != null) {
    console.error(`invalid schema \`${contestFile}\``, baseContestParse.error)
    return
  }
  const {
    data: { bojId, ...data },
  } = baseContestParse
  const bojBoard = await fetchBojBoard(bojId)
  if (bojBoard != null) {
    await fs.writeFile(
      contestFile,
      JSON.stringify(
        {
          ...data,
          bojId,
          ...bojBoard,
          boardType: "boj",
        },
        null,
        2,
      ),
    )
    return
  }
  const spotboard = await fetchSpotboard(bojId)
  if (spotboard != null) {
    await fs.writeFile(
      contestFile,
      JSON.stringify(
        {
          ...data,
          bojId,
          ...spotboard,
          boardType: "spotboard",
        },
        null,
        2,
      ),
    )
    return
  }
  console.error(`could not fetch contest \`${contestFile}\``)
}

const cli = cac("contest-fetcher")
cli
  .command("", "Fetch contest data")
  .option(
    "--mode <type>",
    'Specify "single" to fetch one contest or "all" to fetch all contests',
  )
  .option("--name <contestName>", 'Specify contest name if mode is "single"', {
    default: "",
  })
  .action(async (options: { mode: "single" | "all"; name: string }) => {
    const { mode, name } = options

    if (mode === "all") {
      const projectRoot = path.resolve(import.meta.dirname, "..")
      for await (const contestFile of fs.glob(
        path.join(projectRoot, "contests/*.json"),
      )) {
        processContestFile(contestFile)
      }
    } else if (mode === "single") {
      if (!name) {
        console.error(
          'Please specify a contest name with --name when mode is "single"',
        )
        process.exit(1)
      }
      const projectRoot = path.resolve(import.meta.dirname, "..")
      const contestFile = path.join(projectRoot, `contests/${name}`)
      processContestFile(contestFile)
    } else {
      console.error('Invalid mode. Use "single" or "all"')
      process.exit(1)
    }
  })

// Parse CLI arguments
cli.parse()