import path from 'path'

import { html as code } from 'common-tags'

import { IChange, IChangeAddedFile } from 'changes/@types'
import { IExerciseStepsItem } from 'exercise/@types'
import { IChangeToExerciseItemParser } from 'exercise/changeParsers/@types'

import { toFolderName } from 'exercise/changeParsers/util/toFolderName'

function shouldParse(changes: IChange[]): changes is IChangeAddedFile[] {
  return (
    changes.length === 1 && changes[0].type === 'added' && !('code' in changes[0])
  )
}

function parse(
  changes: IChangeAddedFile[],
  changePosition?: number
): IExerciseStepsItem {
  if (!shouldParse(changes)) throw Error('Programming error: Should not be parsing')

  const change = changes[0]

  const folder = path.dirname(change.filePath)
  const fileName = path.basename(change.filePath)

  const displayFolderName = toFolderName(folder)

  return {
    position: changePosition,
    statement: code`
      Adicione o arquivo ${fileName} na pasta ${displayFolderName}. Este arquivo é um arquivo que foi disponibilizado já pronto para você.
    `
  }
}

export const addedPreMadeFileParser: IChangeToExerciseItemParser<
  IChangeAddedFile
> = {
  shouldParse,
  parse
}
