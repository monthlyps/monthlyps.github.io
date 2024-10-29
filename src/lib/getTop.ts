import type { InferEntrySchema } from "astro:content"

export type TopRecord = {
  name: string
  solve: number
  penalty: number
  rank: number
}

export function getTop(contest: InferEntrySchema<"contests">) {
  const solves = new Map<string, number>()
  const penalties = new Map<string, number>()
  const solveds = new Map<string, Set<string>>()
  for (const run of contest.runs) {
    let solved = solveds.get(run.who)
    if (solved == null) {
      solved = new Set()
      solveds.set(run.who, solved)
    }
    if (solved.has(run.problem)) continue
    switch (run.result) {
      case "ACCEPTED":
        solves.set(run.who, (solves.get(run.who) ?? 0) + 1)
        penalties.set(
          run.who,
          (penalties.get(run.who) ?? 0) + run.submissionMinute,
        )
        solved.add(run.problem)
        break
      case "INCORRECT":
        penalties.set(run.who, (penalties.get(run.who) ?? 0) + contest.penalty)
        break
    }
  }
  const participants = contest.participants.map((name) => ({
    name,
    solve: solves.get(name) ?? 0,
    penalty: penalties.get(name) ?? 0,
    rank: 0,
  }))
  participants.sort((a, b) => {
    if (a.solve === b.solve) {
      if (a.penalty === b.penalty) return a.name.localeCompare(b.name)
      return a.penalty - b.penalty
    }
    return b.solve - a.solve
  })
  let rank = 0
  const prevSolve = 0
  const prevPenalty = 0
  for (const participant of participants) {
    if (prevSolve !== participant.solve || prevPenalty !== participant.penalty)
      rank++
    participant.rank = rank
  }
  return participants
}
