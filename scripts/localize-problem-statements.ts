import * as crypto from "node:crypto"
import * as fs from "node:fs/promises"
import * as path from "node:path"

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
const statementsDir = path.join(root, "src", "data", "problem-statements")
const assetsDir = path.join(root, "public", "problem-assets")

const assetHosts = new Set(["upload.acmicpc.net", "u.acmicpc.net"])

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

  const response = await fetch(url)
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

async function listJsonFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name)
      if (entry.isDirectory()) return listJsonFiles(entryPath)
      if (entry.isFile() && entry.name.endsWith(".json")) return [entryPath]
      return []
    }),
  )
  return nested.flat()
}

await fs.mkdir(assetsDir, { recursive: true })

const files = await listJsonFiles(statementsDir)
for (const file of files) {
  const statement = JSON.parse(
    await fs.readFile(file, "utf8"),
  ) as ProblemStatement

  for (const url of findLocalizableUrls(
    `${statement.infoHtml}\n${statement.bodyHtml}`,
  )) {
    const localPath = await localizeAsset(
      url,
      preferredAssetFilename(
        `${statement.infoHtml}\n${statement.bodyHtml}`,
        url,
      ),
    )
    statement.infoHtml = statement.infoHtml.replaceAll(
      new RegExp(escapeRegExp(url), "g"),
      localPath,
    )
    statement.bodyHtml = statement.bodyHtml.replaceAll(
      new RegExp(escapeRegExp(url), "g"),
      localPath,
    )
  }

  statement.infoHtml = removeAcmicpcLinks(statement.infoHtml)
  statement.bodyHtml = addDownloadAttributes(
    removeAcmicpcLinks(statement.bodyHtml),
  )

  await fs.writeFile(file, `${JSON.stringify(statement, null, 2)}\n`)
  console.log(path.relative(root, file))
}
