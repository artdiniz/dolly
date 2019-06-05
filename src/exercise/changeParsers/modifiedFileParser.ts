import path from 'path'

import { html as code } from 'common-tags'

import { IChange, IChangeModifiedFileWithCode } from 'changes/@types'
import { IExerciseStepsItem } from 'exercise/@types'
import { IChangeToExerciseItemParser } from 'exercise/changeParsers/@types'

function shouldParse(changes: IChange[]): changes is IChangeModifiedFileWithCode[] {
  return (
    changes.length === 1 && changes[0].type === 'modified' && 'code' in changes[0]
  )
}

function parse(changes: IChange[], changePosition?: number): IExerciseStepsItem {
  if (!shouldParse(changes)) throw Error('Programming error: Should not be parsing')

  const change = changes[0]

  const folder = path.dirname(change.filePath)
  const fileName = path.basename(change.filePath)

  return {
    position: changePosition,
    statement: code`
      No arquivo ${fileName} na pasta ${folder} faça as seguintes alterações:
    `,
    codeChanges: [
      {
        code: change.code,
        codeLanguage: change.codeLanguage,
        filePath: change.filePath
      }
    ]
  }
}

export const modifiedFileParser: IChangeToExerciseItemParser<
  IChangeModifiedFileWithCode
> = {
  shouldParse,
  parse
}
