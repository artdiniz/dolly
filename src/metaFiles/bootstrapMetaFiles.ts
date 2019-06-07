import path from 'path'
import { html as code } from 'common-tags'
import { loremIpsum } from 'lorem-ipsum'

import { createDir, readDir, readFile, writeFile } from 'utils/fs'
import { partition } from 'utils/reducers/partition'

export function bootstrapMetaFiles({
  path: metaDirPath,
  chapterIds
}: {
  path: string
  chapterIds: string[]
}) {
  const createMetaDirPromise = createDir(metaDirPath)

  async function getFilesContent() {
    await createMetaDirPromise

    const metaDirFiles = await readDir(metaDirPath)
    const metaFilesId = metaDirFiles
      .filter(fileName => path.extname(fileName) === '.md')
      .map(metaFileName => path.basename(metaFileName).replace(/\.md$/, ''))

    const [chaptersWithMetaFiles, chaptersMissingMetaFiles] = chapterIds.reduce(
      partition(chapterId => metaFilesId.includes(chapterId)),
      [[], []]
    )

    const readyMetaFilesContentByChapterId = chaptersWithMetaFiles
      .map(metaFileId => {
        const metaFilePath = path.join(metaDirPath, metaFileId + '.md')
        return {
          [metaFileId]: readFile(metaFilePath)
        }
      })
      .reduce(Object.assign, {})

    const missingMetaFilesContentByChapterId = chaptersMissingMetaFiles
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
      ...readyMetaFilesContentByChapterId,
      ...missingMetaFilesContentByChapterId
    } as {
      [chapterId: string]: Promise<string>
    }
  }

  return {
    readFilesContent: getFilesContent
  }
}
