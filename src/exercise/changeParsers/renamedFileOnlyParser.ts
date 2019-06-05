import path from 'path'

import { html as code } from 'common-tags'

import { IChange, IChangeRenamedOnlyFile } from 'changes/@types'
import { IExerciseStepsItem } from 'exercise/@types'
import { IChangeToExerciseItemParser } from 'exercise/changeParsers/@types'

function shouldParse(changes: IChange[]): changes is IChangeRenamedOnlyFile[] {
  return changes.length === 1 && changes[0].type === 'renamedOnly'
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

  return {
    position: changePosition,
    statement: statement
  }
}

export const renamedFileOnlyParser: IChangeToExerciseItemParser<
  IChangeRenamedOnlyFile
> = {
  shouldParse,
  parse
}
