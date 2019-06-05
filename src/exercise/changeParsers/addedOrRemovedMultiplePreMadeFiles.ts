import { html as code } from 'common-tags'

import { IChange, IChangeAddedFile, IChangeDeletedFile } from 'changes/@types'
import { IExerciseStepsItem } from 'exercise/@types'
import { IChangeToExerciseItemParser } from 'exercise/changeParsers/@types'

function shouldParse(
  changes: IChange[]
): changes is (IChangeAddedFile | IChangeDeletedFile)[] {
  return (
    changes.length > 1 &&
    changes.filter(
      change =>
        (change.type === 'deleted' || change.type === 'added') && !('code' in change)
    ).length === changes.length
  )
}

function parse(changes: IChange[], changePosition?: number): IExerciseStepsItem {
  if (!shouldParse(changes)) throw Error('Programming error: Should not be parsing')

  return {
    position: changePosition,
    statement: code`
      Adicione ou remova os arquivos prontos do curso:
      ${changes.map(change => change.filePath)}
    `
  }
}

export const addedOrRemovedMultiplePreMadeFiles: IChangeToExerciseItemParser<
  IChangeAddedFile | IChangeDeletedFile
> = {
  shouldParse,
  parse
}
