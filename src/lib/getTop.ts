import type { InferEntrySchema } from "astro:content"

export type TopRecord = {
  name: string
  solve: {
    [number: string]: {
      accepted: boolean
      incorrect: number
      solvedAt: number
    }
  }
  acceptedCount: number
  totalPenalty: number
  rank: number
}

export function getTop(contest: InferEntrySchema<"contests">) {
  const records = new Map<string, TopRecord>(
    contest.participants.map((name) => [
      name,
      {
        name,
        solve: Object.fromEntries(
          contest.problems.map(({ number }) => [
            number,
            {
              accepted: false,
              incorrect: 0,
              solvedAt: 0,
            },
          ]),
        ),
        acceptedCount: 0,
        totalPenalty: 0,
        rank: 0,
      },
    ]),
  )
  for (const run of contest.runs) {
    const record = records.get(run.who)!
    const solve = record.solve[run.problem]
    if (solve.accepted) continue
    switch (run.result) {
      case "ACCEPTED":
        solve.accepted = true
        solve.solvedAt = run.submissionMinute
        record.acceptedCount++
        record.totalPenalty += solve.solvedAt
        record.totalPenalty += solve.incorrect * contest.penalty
        break
      case "INCORRECT":
        solve.incorrect++
        break
    }
  }
  const participants = [...records.values()]
  participants.sort((a, b) => {
    if (a.solve === b.solve) {
      if (a.totalPenalty === b.totalPenalty) return a.name.localeCompare(b.name)
      return a.totalPenalty - b.totalPenalty
    }
    return b.acceptedCount - a.acceptedCount
  })
  let rank = 0
  let prevAccepted = 0
  let prevPenalty = 0
  for (const participant of participants) {
    if (
      prevAccepted !== participant.acceptedCount ||
      prevPenalty !== participant.totalPenalty
    ) {
      rank++
      prevAccepted = participant.acceptedCount
      prevPenalty = participant.totalPenalty
    }
    participant.rank = rank
  }
  return participants
}
