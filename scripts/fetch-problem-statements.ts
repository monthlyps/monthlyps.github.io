import * as crypto from "node:crypto"
import * as fs from "node:fs/promises"
import * as path from "node:path"

type ContestMetadata = Record<string, { bojId: string }>

type FetchedContest = {
  title: string
  problems: {
    title: string
    number: string
  }[]
}

type ProblemStatement = {
  contestSlug: string
  contestTitle: string
  contestId: string
  problemIndex: number
  problemNumber: string
  problemTitle: string
  bojProblemId: string
  infoHtml: string
  bodyHtml: string
}

const root = path.resolve(import.meta.dirname, "..")
const assetsDir = path.join(root, "public", "problem-assets")
const assetHosts = new Set(["upload.acmicpc.net", "u.acmicpc.net"])

const fetchConfig = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36",
  },
} satisfies RequestInit

function matchRequired(source: string, pattern: RegExp, label: string): string {
  const match = source.match(pattern)
  if (match == null) {
    throw new Error(`could not find ${label}`)
  }
  return match[1]
}

function contentTypeToExtension(contentType: string | null): string {
  const type = contentType?.split(";")[0].trim().toLowerCase()
  if (type === "image/png") return ".png"
  if (type === "image/jpeg") return ".jpg"
  if (type === "image/gif") return ".gif"
  if (type === "image/webp") return ".webp"
  if (type === "image/svg+xml") return ".svg"
  if (type === "video/mp4") return ".mp4"
  return ".bin"
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function removeAcmicpcLinks(html: string): string {
  return html
    .replaceAll(
      /<a\b[^>]*href="https:\/\/www\.acmicpc\.net\/[^"]*"[^>]*>([\s\S]*?)<\/a>/g,
      "$1",
    )
    .replaceAll(
      /<a\b[^>]*href="\/(?:user|category|problem)(?:\/|$)[^"]*"[^>]*>([\s\S]*?)<\/a>/g,
      "$1",
    )
}

function findLocalizableUrls(html: string): string[] {
  const urls = new Set<string>()
  for (const match of html.matchAll(/\b(?:src|poster|href)="([^"]+)"/g)) {
    try {
      const url = new URL(match[1], "https://www.acmicpc.net")
      if (assetHosts.has(url.hostname)) {
        urls.add(url.href)
      }
    } catch {
      // Ignore malformed attributes from archived statement HTML.
    }
  }
  return [...urls]
}

function filenameFromText(value: string): string | null {
  const filename = value.replaceAll(/[<>]/g, "").trim()
  if (!/^[\w.+-]+\.[A-Za-z0-9]+$/.test(filename)) return null
  return filename
}

function preferredAssetFilename(html: string, url: string): string | null {
  for (const match of html.matchAll(
    /<a\b(?=[^>]*\bhref="([^"]+)")([^>]*)>([\s\S]*?)<\/a>/g,
  )) {
    const href = new URL(match[1], "https://www.acmicpc.net").href
    if (href !== url) continue

    const download = match[2].match(/\bdownload="([^"]+)"/)?.[1]
    return filenameFromText(download ?? match[3])
  }

  return null
}

function addDownloadAttributes(html: string): string {
  return html.replaceAll(
    /<a\b([^>]*href="\/problem-assets\/[^"]+"[^>]*)>([^<]+)<\/a>/g,
    (match, attributes: string, label: string) => {
      if (/\bdownload=/.test(attributes)) return match

      const filename = label.trim()
      if (!/^[\w.+-]+\.[A-Za-z0-9]+$/.test(filename)) return match

      return `<a${attributes} download="${filename}">${label}</a>`
    },
  )
}

async function localizeAsset(
  url: string,
  preferredFilename: string | null,
): Promise<string> {
  const hash = crypto
    .createHash("sha256")
    .update(url)
    .digest("hex")
    .slice(0, 16)
  const existing = await fs.readdir(assetsDir).catch((): string[] => [])
  if (preferredFilename != null && existing.includes(preferredFilename)) {
    return `/problem-assets/${preferredFilename}`
  }

  const found = existing.find((name) => name.startsWith(`${hash}.`))
  if (found != null) {
    if (preferredFilename != null) {
      await fs.rename(
        path.join(assetsDir, found),
        path.join(assetsDir, preferredFilename),
      )
      return `/problem-assets/${preferredFilename}`
    }

    return `/problem-assets/${found}`
  }

  const response = await fetch(url, fetchConfig)
  if (!response.ok) {
    throw new Error(`failed to fetch asset ${url}: ${response.status}`)
  }

  const extension = contentTypeToExtension(response.headers.get("content-type"))
  const filename = preferredFilename ?? `${hash}${extension}`
  const data = Buffer.from(await response.arrayBuffer())
  await fs.mkdir(assetsDir, { recursive: true })
  await fs.writeFile(path.join(assetsDir, filename), data)
  return `/problem-assets/${filename}`
}

async function normalizeProblemHtml(html: string): Promise<string> {
  let normalized = html.replaceAll(
    /<button\b[^>]*class="[^"]*\bcopy-button\b[^"]*"[^>]*>.*?<\/button>/gs,
    "",
  )

  for (const url of findLocalizableUrls(normalized)) {
    const localPath = await localizeAsset(
      url,
      preferredAssetFilename(normalized, url),
    )
    normalized = normalized.replaceAll(
      new RegExp(escapeRegExp(url), "g"),
      localPath,
    )
  }

  return addDownloadAttributes(removeAcmicpcLinks(normalized)).replaceAll(
    /(<(?:img|script|source)[^>]+src=")https:\/\/www\.acmicpc\.net\/([^"]+")/g,
    "$1/$2",
  )
}

async function fetchProblem(
  contestSlug: string,
  contestTitle: string,
  contestId: string,
  problemIndex: number,
  problemNumber: string,
  problemTitle: string,
): Promise<ProblemStatement> {
  const response = await fetch(
    `https://www.acmicpc.net/contest/problem/${contestId}/${problemIndex}`,
    fetchConfig,
  )
  if (!response.ok) {
    throw new Error(
      `failed to fetch contest ${contestId} problem ${problemIndex}: ${response.status}`,
    )
  }

  const bojUrl = response.url
  const bojProblemId = matchRequired(bojUrl, /\/problem\/(\d+)$/, "problem id")
  const html = await response.text()
  const infoHtml = await normalizeProblemHtml(
    matchRequired(
      html,
      /<table class="table" id="problem-info">([\s\S]*?)<\/table>/,
      "problem info",
    ),
  )
  const bodyHtml = await normalizeProblemHtml(
    matchRequired(
      html,
      /<div id="problem-body" class="">([\s\S]*?)<\/div>\s*<div class="margin-bottom-20">/,
      "problem body",
    ),
  )

  return {
    contestSlug,
    contestTitle,
    contestId,
    problemIndex,
    problemNumber,
    problemTitle,
    bojProblemId,
    infoHtml,
    bodyHtml,
  }
}

const metadata = JSON.parse(
  await fs.readFile(path.join(root, "contests", "metadata.json"), "utf8"),
) as ContestMetadata

const outDir = path.join(root, "src", "data", "problem-statements")
await fs.mkdir(outDir, { recursive: true })

function contestSlugToPath(contestSlug: string): string {
  return contestSlug.replace("-", path.sep).replace("-", path.sep)
}

for (const [contestSlug, { bojId }] of Object.entries(metadata)) {
  const contest = JSON.parse(
    await fs.readFile(
      path.join(root, "contests", "fetched", `${contestSlug}.json`),
      "utf8",
    ),
  ) as FetchedContest

  const contestOutDir = path.join(outDir, contestSlugToPath(contestSlug))
  await fs.mkdir(contestOutDir, { recursive: true })

  for (const [index, problem] of contest.problems.entries()) {
    const statement = await fetchProblem(
      contestSlug,
      contest.title,
      bojId,
      index + 1,
      problem.number,
      problem.title,
    )
    await fs.writeFile(
      path.join(contestOutDir, `${index + 1}.json`),
      `${JSON.stringify(statement, null, 2)}\n`,
    )
    console.log(
      `${contestSlugToPath(contestSlug)}/${index + 1} -> ${statement.bojProblemId} ${problem.title}`,
    )
  }
}
