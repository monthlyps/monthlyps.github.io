#!/usr/bin/env node

// This script lists participants who have participated in contests
// for at least a specified number of months.
// Usage:
// pnpm list-participants-by-months -- --min-months 12

import { promises as fs } from "node:fs"
import path from "node:path"

const DEFAULT_BASE = path.join("contests", "fetched")
const DEFAULT_MIN_MONTHS = 11

const parseArgs = () => {
  const args = process.argv.slice(2)
  let base = DEFAULT_BASE
  let minMonths = DEFAULT_MIN_MONTHS

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === "--base") {
      base = args[i + 1] ?? ""
      i += 1
      continue
    }
    if (arg === "--min-months") {
      const value = Number(args[i + 1])
      if (Number.isNaN(value)) {
        throw new Error("--min-months must be a number")
      }
      minMonths = value
      i += 1
      continue
    }
  }

  return { base, minMonths }
}

const getMonthsFromFilename = (filename: string): number[] => {
  const name = path.parse(filename).name
  const match = name.match(/^(\d{4})-(.+)$/)
  if (!match) {
    return []
  }
  const suffix = match[2]

  // Special handling: 0405 -> April and May
  if (suffix.startsWith("0405")) {
    return [4, 5]
  }

  const monthMatch = suffix.match(/^(\d{2})/)
  if (!monthMatch) {
    return []
  }
  return [Number(monthMatch[1])]
}

const main = async () => {
  const { base, minMonths } = parseArgs()
  const baseDir = path.isAbsolute(base) ? base : path.join(process.cwd(), base)

  const monthParticipants = new Map<number, Set<string>>()
  for (let month = 1; month <= 12; month += 1) {
    monthParticipants.set(month, new Set())
  }

  const entries = await fs.readdir(baseDir)
  for (const entry of entries) {
    if (!entry.endsWith(".json")) {
      continue
    }
    const fullPath = path.join(baseDir, entry)
    const months = getMonthsFromFilename(entry)
    if (months.length === 0) {
      continue
    }

    const raw = await fs.readFile(fullPath, "utf-8")
    const data = JSON.parse(raw) as { participants?: string[] }
    const participants = data.participants ?? []

    for (const month of months) {
      const set = monthParticipants.get(month)
      if (!set) {
        continue
      }
      for (const handle of participants) {
        set.add(handle)
      }
    }
  }

  const counts = new Map<string, number>()
  for (const participants of monthParticipants.values()) {
    for (const handle of participants) {
      counts.set(handle, (counts.get(handle) ?? 0) + 1)
    }
  }

  const filtered = Array.from(counts.entries())
    .filter(([, count]) => count >= minMonths)
    .map(([handle]) => handle)
    .sort((a, b) => a.localeCompare(b))

  console.log(`count: ${filtered.length}`)
  for (const handle of filtered) {
    console.log(handle)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
