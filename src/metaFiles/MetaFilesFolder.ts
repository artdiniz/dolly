import path from 'path'
import _partition from 'lodash/partition'
import { loremIpsum } from 'lorem-ipsum'

import { createDir, readDir, readFile, readDirDeep } from 'utils/fs'
import { toChapterMetaMarkdown } from 'exercise/metaMarkdown'

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
    .map(chapterFileName => {
      const metaFilePath = path.join(metaDirPath, chapterFileName + '.md')
      return {
        [chapterFileName]: readFile(metaFilePath)
      }
    })
    .reduce(Object.assign, {})

  const missingMetaContentByChapterId = chaptersMissingMetaFiles
    .map(chapterFileName => {
      const fillerText = loremIpsum({ units: 'words', count: 20 })
      const fileContent = toChapterMetaMarkdown({
        title: `Titulo do capítulo ${chapterFileName}`,
        objective: `Objetivo do capítulo ${chapterFileName} ${fillerText}`,
        steps: []
      })

      return {
        [chapterFileName]: Promise.resolve(fileContent)
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

async function readAssetsPaths(metaDirPath: string) {
  const metaDirDeepFiles = await readDirDeep(metaDirPath, {
    absolute: false
  })

  const metaFiles = getMetaFilesFrom(metaDirDeepFiles)

  const assetsFiles = metaDirDeepFiles.filter(file => !metaFiles.includes(file))

  return assetsFiles
}

export function MetaFilesFolder({ path: metaDirPath }: { path: string }) {
  const createMetaDirPromise = createDir(metaDirPath)

  async function getMetaInfoByChapterName(chapters: string[]) {
    await createMetaDirPromise
    return await readOrCreateChaptersFrom(metaDirPath, chapters)
  }

  async function getAssetsRelativePath() {
    await createMetaDirPromise
    return await readAssetsPaths(metaDirPath)
  }

  return {
    getMetaInfoByChapterName,
    getAssetsRelativePaths: getAssetsRelativePath
  }
}
