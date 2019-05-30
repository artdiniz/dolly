import { promisify } from 'util'
import mkdirp from 'mkdirp'

export const createDir = (dirPath: string) =>
  promisify(mkdirp)(dirPath).then(() => dirPath)
