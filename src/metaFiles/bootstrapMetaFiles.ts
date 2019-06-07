import path from 'path'
import _partition from 'lodash/partition'
import { html as code } from 'common-tags'
import { loremIpsum } from 'lorem-ipsum'

import { createDir, readDir, readFile, writeFile } from 'utils/fs'

async function readOrCreateChaptersFrom(metaDirPath: string, chapterIds: string[]) {
  const metaDirFiles = await readDir(metaDirPath)

  const metaFilesId = metaDirFiles
    .filter(fileName => path.extname(fileName) === '.md')
    .map(metaFileName => path.basename(metaFileName).replace(/\.md$/, ''))

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

export function MetaFilesFolder({ path: metaDirPath }: { path: string }) {
  const createMetaDirPromise = createDir(metaDirPath)

  async function readOrCreateMetasFromChapters(chapters: string[]) {
    await createMetaDirPromise
    return readOrCreateChaptersFrom(metaDirPath, chapters)
  }

  return {
    readMetasFromChapters: readOrCreateMetasFromChapters
  }
}
