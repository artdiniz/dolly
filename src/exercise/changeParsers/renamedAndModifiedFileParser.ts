import path from 'path'

import { html as code } from 'common-tags'

import { IChange, IChangeRenamedModifiedFileWithCode } from 'changes/@types'
import { IExerciseStepsItem } from 'exercise/@types'
import { IChangeToExerciseItemParser } from 'exercise/changeParsers/@types'

import { toFolderName } from 'exercise/changeParsers/util/toFolderName'
import { boldCode } from 'exercise/changeParsers/util/markdown/boldCode'

function shouldParse(
  changes: IChange[]
): changes is IChangeRenamedModifiedFileWithCode[] {
  return changes.length === 1 && changes[0].type === 'renamedAndModified'
}

function parse(changes: IChange[], changePosition?: number): IExerciseStepsItem {
  if (!shouldParse(changes)) throw Error('Programming error: Should not be parsing')

  const change = changes[0]
  const oldFolder = path.dirname(change.oldFilePath)
  const oldFileName = path.basename(change.oldFilePath)

  const newFolder = path.dirname(change.newFilePath)
  const newFileName = path.basename(change.newFilePath)

  const hasMovedOnly = oldFolder !== newFolder && oldFileName === newFileName

  const hasRenamedFileOnly = oldFolder === newFolder && oldFileName !== newFileName

  const hasMovedAndRenamed = oldFolder !== newFolder && oldFileName !== newFileName

  const displayOldFolder = boldCode(toFolderName(oldFolder))
  const displayOldFileName = boldCode(oldFileName)

  const displayNewFolder = boldCode(toFolderName(newFolder))
  const displayNewFileName = boldCode(newFileName)

  let statement: string

  if (hasMovedOnly) {
    statement = code`
      Mova o arquivo ${displayNewFileName} para a pasta ${displayNewFolder}. No momento este arquivo está na pasta ${displayOldFolder}.
    `
  } else if (hasRenamedFileOnly) {
    statement = code`
      Na pasta ${displayOldFolder}, renomeie o arquivo ${displayOldFileName} para ${displayNewFileName}
    `
  } else if (hasMovedAndRenamed) {
    statement = code`
      Mova o arquivo ${displayOldFileName} para a pasta ${displayNewFolder} e o renomeie para ${displayNewFileName}. No momento o arquivo está na pasta ${displayOldFolder}.
    `
  } else {
    throw new Error(`This shouldn't happen`)
  }

  statement += `\nFaça também as seguintes modificações no código:\n`

  return {
    position: changePosition,
    statement: statement,
    changes: [
      {
        filePath: change.newFilePath,
        type: change.type,
        code: change.code,
        codeLanguage: change.codeLanguage
      }
    ]
  }
}

export const renamedAndModifiedFileParser: IChangeToExerciseItemParser<
  IChangeRenamedModifiedFileWithCode
> = {
  shouldParse,
  parse
}
