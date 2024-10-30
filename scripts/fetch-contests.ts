import { processContestFile } from "./utils.ts"
import * as fs from "node:fs/promises"
import * as path from "node:path"

const projectRoot = path.resolve(import.meta.dirname, "..")
for await (const contestFile of fs.glob(
  path.join(projectRoot, "contests/*.json"),
)) {
  processContestFile(contestFile)
}
