import fs from 'fs'
import { promisify } from 'util'

export const readDir = (dirPath: string) => promisify(fs.readdir)(dirPath)
