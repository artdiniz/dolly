import treeify from 'treeify'

import { html as code } from 'common-tags'

import _partiton from 'lodash/partition'

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

  const addedFiles: string[] = changes
    .filter(change => change.type === 'added')
    .map(change => change.filePath)

  const addedFileTree = toFileTreeObject(addedFiles)

  const deletedFiles = changes
    .filter(change => change.type === 'deleted')
    .map(change => change.filePath)

  const deletedFileTree = toFileTreeObject(deletedFiles)

  const deletedFileTreeInfo = getTreeObjectInfo(deletedFileTree)
  const addedFileTreeInfo = getTreeObjectInfo(addedFileTree)

  let addedFilesStatement
  if (addedFiles.length === 1) {
    addedFilesStatement = addedSingleFileSentence({
      fileName: addedFiles[0],
      folderName: addedFileTreeInfo.rootFolders[0] || 'raiz do projeto'
    })
  } else if (addedFiles.length > 1 && addedFileTreeInfo.rootFolders.length === 1) {
    addedFilesStatement = addedMultipleFilesInSingleFolderSentence({
      qtFiles: addedFiles.length,
      folderName: addedFileTreeInfo.rootFolders[0] || 'raiz do projeto'
    })
  } else if (addedFiles.length > 1 && addedFileTreeInfo.rootFolders.length > 1) {
    addedFilesStatement = addedMultipleFilesInMultipleFoldersSentence({
      qtFiles: addedFiles.length,
      folderNameList:
        addedFileTreeInfo.rootFiles.length === 0
          ? addedFileTreeInfo.rootFolders
          : [...addedFileTreeInfo.rootFolders, 'raiz do projeto']
    })
  }

  let deletedFilesStatement
  if (deletedFiles.length === 1) {
    deletedFilesStatement = deletedSingleFileSentence({
      fileName: deletedFiles[0],
      folderName: deletedFileTreeInfo.rootFolders[0] || 'raiz do projeto'
    })
  } else if (
    deletedFiles.length > 1 &&
    deletedFileTreeInfo.rootFolders.length === 1
  ) {
    deletedFilesStatement = deletedMultipleFilesInSingleFolderSentence({
      qtFiles: deletedFiles.length,
      folderName: deletedFileTreeInfo.rootFolders[0] || 'raiz do projeto'
    })
  } else if (deletedFiles.length > 1 && deletedFileTreeInfo.rootFolders.length > 1) {
    deletedFilesStatement = deletedMultipleFilesInMultipleFoldersSentence({
      qtFiles: deletedFiles.length,
      folderNameList:
        deletedFileTreeInfo.rootFiles.length === 0
          ? deletedFileTreeInfo.rootFolders
          : [...deletedFileTreeInfo.rootFolders, 'raiz do projeto']
    })
  }

  const preMadeWarningStatement =
    addedFiles.length + deletedFiles.length === 1
      ? 'Note que esse arquivo foi disponibilizado já pronto para você.'
      : 'Note que esses arquivos foram disponibilizados já prontos para você.'

  const mainStatement =
    addedFiles.length > 0 && deletedFiles.length > 0
      ? `Há ${addedFilesStatement} e ${deletedFilesStatement}.`
      : addedFiles.length > 0
      ? `Há ${addedFilesStatement}.`
      : `Há ${deletedFilesStatement}.`

  const statement = mainStatement + ' ' + preMadeWarningStatement

  const codeChanges = []

  if (addedFiles.length > 0) {
    const addedCodeChangesStatement = `${
      addedFiles.length == 1
        ? 'O arquivo deve ser adicionado'
        : `Os ${addedFiles.length} arquivos devem ser adicionados`
    } na seguinte estrutura de pastas:`

    codeChanges.push({
      statement: addedCodeChangesStatement,
      code: code(treeify.asTree(addedFileTree as treeify.TreeObject, false, true))
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

  if (deletedFiles.length > 0) {
    const deletedCodeChangesStatement = `${
      deletedFiles.length === 1
        ? 'O arquivo que deve ser removido se encontra'
        : `Os ${deletedFiles.length} arquivos que devem ser removidos se encontram`
    } na seguinte estrutura de pastas:`

    codeChanges.push({
      statement: deletedCodeChangesStatement,
      code: code(treeify.asTree(deletedFileTree as treeify.TreeObject, false, true))
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

function addedMultipleFilesInMultipleFoldersSentence({
  qtFiles,
  folderNameList
}: {
  qtFiles: number
  folderNameList: string[]
}) {
  const foldersSentence = folderNameList.join(', ').replace(/, ([^,]+)$/, ' e $1')

  return `${qtFiles} arquivos a serem adicionados nas pastas ${foldersSentence}`
}

function addedMultipleFilesInSingleFolderSentence({
  qtFiles,
  folderName
}: {
  qtFiles: number
  folderName: string
}) {
  return `${qtFiles} arquivos a serem adicionados na pasta ${folderName}`
}

function addedSingleFileSentence({
  fileName,
  folderName
}: {
  fileName: string
  folderName: string
}) {
  return `1 arquivo "${fileName}" a ser adicionado na pasta ${folderName}`
}

function deletedMultipleFilesInMultipleFoldersSentence({
  qtFiles,
  folderNameList
}: {
  qtFiles: number
  folderNameList: string[]
}) {
  const foldersSentence = folderNameList.join(', ').replace(/, ([^,]+)$/, ' e $1')

  return `${qtFiles} arquivos a serem removidos das pastas ${foldersSentence}`
}

function deletedMultipleFilesInSingleFolderSentence({
  qtFiles,
  folderName
}: {
  qtFiles: number
  folderName: string
}) {
  return `${qtFiles} arquivos a serem removidos da pasta ${folderName}`
}

function deletedSingleFileSentence({
  fileName,
  folderName
}: {
  fileName: string
  folderName: string
}) {
  return `1 arquivo "${fileName}" a ser removido da pasta ${folderName}`
}

type ITreeObject = {
  [key: string]: null | ITreeObject
}

function getTreeObjectInfo(treeObject: ITreeObject) {
  const [rootFiles, rootFolders] = _partiton(
    Object.entries(treeObject['pasta_raiz_do_projeto'] || {}),
    ([, value]) => value === null
  )

  return {
    rootFolders: rootFolders.map(([name]) => name),
    rootFiles: rootFiles.map(([name]) => name)
  }
}

function toFileTreeObject(files: string[]): ITreeObject {
  return {
    pasta_raiz_do_projeto: files.reduce(toFileTreeObjectReducer, {})
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toFileTreeObjectReducer(
  subtree: ITreeObject = {},
  path: string
): ITreeObject {
  const splittedPath = path.split('/')

  if (splittedPath.length === 1) {
    subtree[splittedPath[0]] = null
    return subtree
  }

  if (splittedPath.length >= 2) {
    const nextTree = subtree[splittedPath[0]] || {}

    subtree[splittedPath[0]] = {
      ...toFileTreeObjectReducer(nextTree, splittedPath.slice(1).join('/'))
    }
    return subtree
  }

  return subtree
}
