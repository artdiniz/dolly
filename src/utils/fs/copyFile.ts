import fs from 'fs'
import { promisify } from 'util'

export const copyFile = (filePath: string, destPath: string) =>
  promisify(fs.copyFile)(filePath, destPath)
