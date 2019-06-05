import treeify from 'treeify'

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

  function toFileTreeObject(subtree, path: string) {
    const splittedPath = path.split('/')

    const currentTree = subtree[splittedPath[0]] || {}

    if (splittedPath.length === 2) {
      const lastItem = { [splittedPath[1]]: null }
      subtree[splittedPath[0]] = {
        ...currentTree,
        ...lastItem
      }
      return subtree
    }

    if (splittedPath.length > 2) {
      subtree[splittedPath[0]] = {
        ...toFileTreeObject(currentTree, splittedPath.slice(1).join('/'))
      }
      return subtree
    }
  }

  const fileTree = changes
    .map(change => change.filePath)
    .reduce(toFileTreeObject, {})

  console.log(JSON.stringify(fileTree, null, 2))

  return {
    position: changePosition,
    statement: code`
      Adicione ou remova os arquivos prontos do curso
    `,
    codeChanges: [
      {
        code: treeify.asTree(fileTree, false, true),
        codeLanguage: 'fs',
        filePath: 'arquivos do projeto'
      }
    ]
  }
}

export const addedOrRemovedMultiplePreMadeFiles: IChangeToExerciseItemParser<
  IChangeAddedFile | IChangeDeletedFile
> = {
  shouldParse,
  parse
}
