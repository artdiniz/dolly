import expandTilde from 'expand-tilde'
import path from 'path'

export const resolvePathFromCwd = function(inputPath: string) {
  const expandedArgsDir = expandTilde(inputPath)

  const absolutePath = path.resolve(process.cwd(), expandedArgsDir)

  return absolutePath
}
