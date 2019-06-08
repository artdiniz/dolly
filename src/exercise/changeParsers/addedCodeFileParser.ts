import path from 'path'

import { html as code } from 'common-tags'

import { IChange, IChangeAddedFileWithCode } from 'changes/@types'
import { IExerciseStepsItem } from 'exercise/@types'
import { IChangeToExerciseItemParser } from 'exercise/changeParsers/@types'

import { toFolderName } from 'exercise/changeParsers/util/toFolderName'
import { boldCode } from 'exercise/changeParsers/util/markdown/boldCode'

function shouldParse(changes: IChange[]): changes is IChangeAddedFileWithCode[] {
  return changes.length === 1 && changes[0].type === 'added' && 'code' in changes[0]
}

function parse(changes: IChange[], changePosition?: number): IExerciseStepsItem {
  if (!shouldParse(changes)) throw Error('Programming error: Should not be parsing')

  const change = changes[0]

  const folder = path.dirname(change.filePath)
  const fileName = path.basename(change.filePath)

  const displayFolderName = boldCode(toFolderName(folder))
  const displayFileName = boldCode(fileName)

  return {
    position: changePosition,
    statement: code`
      Crie o arquivo ${displayFileName} na pasta ${displayFolderName} com o seguinte código:
    `,
    changes: [
      {
        code: change.code,
        codeLanguage: change.codeLanguage,
        filePath: change.filePath,
        type: 'added'
      }
    ]
  }
}

export const addedCodeFileParser: IChangeToExerciseItemParser<
  IChangeAddedFileWithCode
> = {
  shouldParse,
  parse
}
