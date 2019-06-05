import path from 'path'

import { html as code } from 'common-tags'

import { IChange, IChangeDeletedFile } from 'changes/@types'
import { IExerciseStepsItem } from 'exercise/@types'
import { IChangeToExerciseItemParser } from 'exercise/changeParsers/@types'

import { toFolderName } from 'exercise/changeParsers/util/toFolderName'

function shouldParse(changes: IChange[]): changes is IChangeDeletedFile[] {
  return changes.length === 1 && changes[0].type === 'deleted'
}

function parse(changes: IChange[], changePosition?: number): IExerciseStepsItem {
  if (!shouldParse(changes)) throw Error('Programming error: Should not be parsing')

  const change = changes[0]

  const folder = path.dirname(change.filePath)
  const fileName = path.basename(change.filePath)

  const displayFolderName = toFolderName(folder)

  return {
    position: changePosition,
    statement: code`
      Remova o arquivo ${fileName} na pasta ${displayFolderName}.
    `
  }
}

export const deletedFileParser: IChangeToExerciseItemParser<IChangeDeletedFile> = {
  shouldParse,
  parse
}
