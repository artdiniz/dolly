import fs from 'fs'
import { promisify } from 'util'

export const writeFile = (fileFullPath: string, content: string) =>
  promisify(fs.writeFile)(fileFullPath, content)
