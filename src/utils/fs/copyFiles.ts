import path from 'path'
import { createDir, copyFile } from 'utils/fs'

interface ICopyFilesArg {
  files: string[]
  from: string
  to: string
}

export function copyFiles(copyInfo: ICopyFilesArg): Promise<string>[] {
  return copyInfo.files.map(async fileRelativePath => {
    const srcFilePath = path.join(copyInfo.from, fileRelativePath)
    const destFilePath = path.join(copyInfo.to, fileRelativePath)
    await createDir(path.dirname(destFilePath))
    return copyFile(srcFilePath, destFilePath).then(() => fileRelativePath)
  })
}
