import path from 'path'
import _partition from 'lodash/partition'
import { html as code } from 'common-tags'
import { loremIpsum } from 'lorem-ipsum'

import { createDir, readDir, readFile, writeFile, readDirDeep } from 'utils/fs'

function getMetaFilesFrom(metaDirFiles: string[]) {
  return metaDirFiles
    .filter(fileName => path.dirname(fileName) === '.')
    .filter(fileName => path.extname(fileName) === '.md')
}

async function readOrCreateChaptersFrom(metaDirPath: string, chapterIds: string[]) {
  const metaDirFiles = await readDir(metaDirPath)

  const metaFilesId = getMetaFilesFrom(metaDirFiles).map(metaFileName =>
    path.basename(metaFileName).replace(/\.md$/, '')
  )

  const [chaptersWithMetaFiles, chaptersMissingMetaFiles] = _partition(
    chapterIds,
    chapterId => metaFilesId.includes(chapterId)
  )

  const existentMetaContentByChapterId = chaptersWithMetaFiles
    .map(metaFileId => {
      const metaFilePath = path.join(metaDirPath, metaFileId + '.md')
      return {
        [metaFileId]: readFile(metaFilePath)
      }
    })
    .reduce(Object.assign, {})

  const missingMetaContentByChapterId = chaptersMissingMetaFiles
    .map(metaFileId => {
      const metaFilePath = path.join(metaDirPath, metaFileId + '.md')
      const fillerText = loremIpsum({ units: 'words', count: 20 })
      const fileContent = code`
        Titulo do capítulo ${metaFileId}
        ---
        Objetivo do capítulo ${metaFileId} ${fillerText}
      `
      return {
        [metaFileId]: writeFile(metaFilePath, fileContent).then(() => fileContent)
      }
    })
    .reduce(Object.assign, {})

  return {
    ...existentMetaContentByChapterId,
    ...missingMetaContentByChapterId
  } as {
    [chapterId: string]: Promise<string>
  }
}

async function readAssetsPath(metaDirPath: string) {
  const metaDirDeepFiles = await readDirDeep(metaDirPath, {
    absolute: false
  })

  const metaFiles = getMetaFilesFrom(metaDirDeepFiles)

  const assetsFiles = metaDirDeepFiles.filter(file => !metaFiles.includes(file))

  return assetsFiles
}

export function MetaFilesFolder({ path: metaDirPath }: { path: string }) {
  const createMetaDirPromise = createDir(metaDirPath)

  async function getMetasByChapterName(chapters: string[]) {
    await createMetaDirPromise
    return await readOrCreateChaptersFrom(metaDirPath, chapters)
  }

  async function getAssetsRelativePath() {
    await createMetaDirPromise
    return await readAssetsPath(metaDirPath)
  }

  return {
    getMetasByChapterName,
    getAssetsRelativePath
  }
}
