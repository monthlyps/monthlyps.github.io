import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, it } from "node:test"

const distDir = new URL("../dist/", import.meta.url)

function page(route) {
  const file =
    route === "" || route === "/"
      ? join(distDir.pathname, "index.html")
      : join(distDir.pathname, route, "index.html")

  assert.ok(
    existsSync(file),
    `${file} does not exist. Run \`pnpm run build\` before \`pnpm run test:dist\`.`,
  )

  return readFileSync(file, "utf8")
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function expectCommonLayout(html, title) {
  assert.match(
    html,
    new RegExp(`<title>월간 향유회 - ${escapeRegExp(title)}</title>`),
  )
  assert.match(html, /href="\/"/)
  assert.match(html, /월간 향유회/)
  assert.match(html, /참가자 검색/)
  assert.match(html, /&copy; 2024 monthlyps/)
}

describe("static page smoke tests", () => {
  it("renders the hall of fame index", () => {
    const html = page("")

    expectCommonLayout(html, "명예의 전당")
    assert.match(html, /명예의 전당/)
    assert.match(html, /href="\/contest\/2025\/02"/)
  })

  it("renders the contests list", () => {
    const html = page("contests")

    expectCommonLayout(html, "지난 대회 목록")
    assert.match(html, /지난 대회 목록/)
    assert.match(html, /href="\/contest\/2025\/02"/)
    assert.match(html, /href="\/contest\/2025\/0405\/open"/)
  })

  it("renders a regular contest page with local problem links", () => {
    const html = page("contest/2025/02")

    expectCommonLayout(html, "월간 향유회 2025. 02.")
    assert.match(html, /카탈란과 수열과 쿼리/)
    assert.match(html, /href="\/contest\/2025\/02\/problem\/5"/)
    assert.doesNotMatch(html, /acmicpc\.net/)
  })

  it("renders a regular problem page with MathJax SVG and copy support", () => {
    const html = page("contest/2025/02/problem/5")

    expectCommonLayout(html, "카탈란과 수열과 쿼리")
    assert.match(html, /class="problem-statement"/)
    assert.match(html, /id="sampleinput1"/)
    assert.match(html, /sample-copy-button/)
    assert.match(html, /tex-svg\.js/)
    assert.doesNotMatch(html, /tex-chtml\.js/)
    assert.match(
      html,
      /href="\/problem-assets\/splitmix64\.cpp" download="splitmix64\.cpp"/,
    )
    assert.doesNotMatch(html, /acmicpc\.net|upload\.acmicpc\.net/)
  })

  it("renders a division problem page under its full contest prefix", () => {
    const html = page("contest/2026/0102/open/problem/5")

    expectCommonLayout(html, "문자열 조작의 달인 2")
    assert.match(html, /href="\/contest\/2026\/0102\/open"/)
    assert.match(html, /href="\/contest\/2026\/0102\/open\/problem\/5\/"/)
    assert.match(html, /BOJ 35310번/)
  })

  it("renders editorial pages with pre-rendered math", () => {
    const html = page("editorial/2024/02/1")

    expectCommonLayout(html, "줄다리기")
    assert.match(html, /class="katex"/)
    assert.match(html, /rustiebeats/)
  })

  it("renders user and application pages", () => {
    const userHtml = page("user/aeren")
    const applicationHtml = page("confirm-application")

    expectCommonLayout(userHtml, "aeren 정보")
    assert.match(userHtml, /aeren/)

    expectCommonLayout(applicationHtml, "Onsite 참가 신청 확인")
    assert.match(applicationHtml, /Onsite 대회가 종료되었습니다/)
  })
})
