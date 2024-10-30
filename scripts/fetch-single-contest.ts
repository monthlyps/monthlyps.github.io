import { processContestFile } from "./utils.ts"
import * as path from "node:path"

const fileName = process.argv[2]
const projectRoot = path.resolve(import.meta.dirname, "..")
const contestFile = path.join(projectRoot, `contests/${fileName}`)
processContestFile(contestFile)
