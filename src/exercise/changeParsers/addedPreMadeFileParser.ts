import path from 'path'

import { html as code } from 'common-tags'

import { IChange, IChangeAddedFile } from 'changes/@types'
import { IExerciseStepsItem } from 'exercise/@types'
import { IChangeToExerciseItemParser } from 'exercise/changeParsers/@types'

import { toFolderName } from 'exercise/changeParsers/util/toFolderName'
import { boldCode } from 'exercise/changeParsers/util/markdown/boldCode'

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

  const displayFolderName = boldCode(toFolderName(folder))
  const displayFileName = boldCode(fileName)

  return {
    position: changePosition,
    statement: code`
      Adicione o arquivo ${displayFileName} na pasta ${displayFolderName}. Este arquivo é um arquivo que foi disponibilizado já pronto para você.
    `,
    changes: [
      {
        filePath: change.filePath,
        type: 'addedPreMade'
      }
    ]
  }
}

export const addedPreMadeFileParser: IChangeToExerciseItemParser<
  IChangeAddedFile
> = {
  shouldParse,
  parse
}
