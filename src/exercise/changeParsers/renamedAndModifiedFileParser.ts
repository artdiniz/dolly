import path from 'path'

import { html as code } from 'common-tags'

import { IChange, IChangeRenamedModifiedFileWithCode } from 'changes/@types'
import { IExerciseStepsItem } from 'exercise/@types'
import { IChangeToExerciseItemParser } from 'exercise/changeParsers/@types'

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

  let statement: string

  if (hasMovedOnly) {
    statement = code`
      Mova o arquivo ${newFileName} para a pasta ${newFolder}. No momento este arquivo está em ${oldFolder}.
    `
  } else if (hasRenamedFileOnly) {
    statement = code`
      Na pasta ${oldFolder}, renomeie o arquivo ${oldFileName} para ${newFileName}
    `
  } else if (hasMovedAndRenamed) {
    statement = code`
      Mova o arquivo ${oldFileName} para a pasta ${newFolder} e o renomeie para ${newFileName}. No momento o arquivo está em ${oldFolder}.
    `
  } else {
    throw new Error(`This shouldn't happen`)
  }

  statement += `\nFaça também as seguintes modificações no código:\n`

  return {
    position: changePosition,
    statement: statement,
    codeChanges: [
      {
        code: change.code,
        codeLanguage: change.codeLanguage,
        filePath: change.newFilePath
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
