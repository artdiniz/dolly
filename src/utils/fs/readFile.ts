import fs from 'fs'
import { promisify } from 'util'

export const readFile = (filePath: string) =>
  promisify(fs.readFile)(filePath).then(fileBuffer => fileBuffer.toString())
