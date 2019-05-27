import mkdirp from 'mkdirp'

import { promisify } from 'util'

export function createPath(dirArg: string) {
  return promisify(mkdirp)(dirArg).then(() => dirArg)
}
