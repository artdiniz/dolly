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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function toFileTreeObject(subtree: any, path: string) {
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

  const addedFiles = changes
    .filter(change => change.type === 'added')
    .map(change => change.filePath)

  const addedFileTree = addedFiles.reduce(toFileTreeObject, {})

  const deletedFiles = changes
    .filter(change => change.type === 'deleted')
    .map(change => change.filePath)

  const deletedFileTree = deletedFiles.reduce(toFileTreeObject, {})

  const addedFoldersInRoot = Object.keys(addedFileTree)
  const deletedFoldersInRoot = Object.keys(deletedFileTree)

  const qtAddedFiles = addedFiles.length
  const addedFilesWord =
    qtAddedFiles === 1 ? 'arquivo a ser adicionado' : 'arquivos a serem adicionados'
  const addedFoldersWord =
    addedFoldersInRoot.length === 1 ? 'na pasta' : 'nas pastas'
  const addedFoldersAsSentence = Array.from(addedFoldersInRoot)
    .join(', ')
    .replace(/, ([^,]+)$/, ' e $1')

  const addedFilesStatement =
    qtAddedFiles !== 0 &&
    code`
      ${qtAddedFiles} ${addedFilesWord} ${addedFoldersWord} ${addedFoldersAsSentence}s
    `.trim()

  const qtDeletedFiles = deletedFiles.length
  const deletedFilesWord =
    qtDeletedFiles === 1 ? 'arquivo a ser removido' : 'arquivos a serem removidos'
  const deletedFoldersWord =
    deletedFoldersInRoot.length === 1 ? 'da pasta' : 'das pastas'
  const deletedFoldersAsSentence = Array.from(deletedFoldersInRoot)
    .join(', ')
    .replace(/, ([^,]+)$/, ' e $1')

  const deletedFilesStatement =
    qtDeletedFiles !== 0 &&
    code`
      ${qtDeletedFiles} ${deletedFilesWord} ${deletedFoldersWord} ${deletedFoldersAsSentence}
    `.trim()

  const preMadeWarningStatement =
    qtAddedFiles + qtDeletedFiles === 1
      ? 'Note que esse arquivo foi disponibilizado já pronto para você.'
      : 'Note que esses arquivos foram disponibilizados já prontos para você.'

  const mainStatement =
    qtAddedFiles > 0 && qtDeletedFiles > 0
      ? `Há ${addedFilesStatement} e ${deletedFilesStatement}.`
      : qtAddedFiles > 0
      ? `Há ${addedFilesStatement}.`
      : `Há ${deletedFilesStatement}.`

  const statement = mainStatement + ' ' + preMadeWarningStatement

  const codeChanges = []

  if (qtAddedFiles > 0) {
    const addedCodeChangesStatement = `${
      qtAddedFiles == 1
        ? 'O arquivo deve ser adicionado'
        : `Os ${qtAddedFiles} arquivos devem ser adicionados`
    } na seguinte estrutura de pastas:`

    codeChanges.push({
      statement: addedCodeChangesStatement,
      code: code(treeify.asTree(addedFileTree, false, true))
        .split('\n')
        .map(line => ({
          type: 'context' as 'context',
          content: line
        })),
      codeLanguage: 'fs',
      filePath: 'novos arquivos do projeto',
      type: 'addedMultiplePreMade'
    })
  }

  if (qtDeletedFiles > 0) {
    const deletedCodeChangesStatement = `${
      qtDeletedFiles === 1
        ? 'O arquivo que deve ser removido se encontra'
        : `Os ${qtDeletedFiles} arquivos que devem ser removidos se encontram`
    } na seguinte estrutura de pastas:`

    codeChanges.push({
      statement: deletedCodeChangesStatement,
      code: code(treeify.asTree(deletedFileTree, false, true))
        .split('\n')
        .map(line => ({
          type: 'context' as 'context',
          content: line
        })),
      codeLanguage: 'fs',
      filePath: 'arquivos removidos do projeto',
      type: 'deletedMultiplePreMade'
    })
  }

  return {
    position: changePosition,
    statement: statement,
    changes: codeChanges
  }
}

export const addedOrRemovedMultiplePreMadeFiles: IChangeToExerciseItemParser<
  IChangeAddedFile | IChangeDeletedFile
> = {
  shouldParse,
  parse
}
