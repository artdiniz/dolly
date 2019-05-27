import expandTilde from 'expand-tilde'
import path from 'path'

export const resolvePathFromCwd = function(inputPath: string) {
  const argsDir = inputPath
  const expandedArgsDir = argsDir !== undefined && expandTilde(argsDir)

  if (!expandedArgsDir) return null

  const absolutePath = path.resolve(process.cwd(), expandedArgsDir)

  return absolutePath
}
