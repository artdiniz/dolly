import path from 'path'

import { resolvePathFromCwd } from 'utils/path/resolvePathFromCwd'
import { createDir, readDir, readFile, writeFile, copyFile } from 'utils/fs'

import { MetaFilesFolder } from 'metaFiles/MetaFilesFolder'
import { generateChapter } from 'generator/generateChapter'
import { $ResultsView } from 'view/$ResultsView'

process.on('unhandledRejection', (error: Error) => {
  console.error('Unhandled Rejection. Reason:')
  console.error(error)
  process.exit(1)
})

const cliArgs = process.argv.slice(2)
const diffFilesDirArg = cliArgs[0]
const metaFilesDirArg = cliArgs[1]
const outputDirArg = cliArgs[2]

const diffDir = diffFilesDirArg
  ? resolvePathFromCwd(diffFilesDirArg)
  : resolvePathFromCwd('./dolly/diffs')

run({
  diff: diffDir,
  meta: metaFilesDirArg
    ? resolvePathFromCwd(metaFilesDirArg)
    : path.resolve(diffDir, '../meta'),
  output: outputDirArg
    ? resolvePathFromCwd(outputDirArg)
    : path.resolve(diffDir, '../generated')
})

interface IArgDirectories {
  diff: string
  meta: string
  output: string
}

async function run(directories: IArgDirectories) {
  await createDir(directories.output)

  const chapterFileNames = (await readDir(directories.diff))
    .filter(fileName => path.extname(fileName) === '.diff')
    .map(diffFileName => path.basename(diffFileName).replace(/\.diff$/, ''))

  const metaFilesFolder = MetaFilesFolder({
    path: directories.meta
  })

  const metaContentByChapterName = await metaFilesFolder.getMetasByChapterName(
    chapterFileNames
  )

  const generateAndWriteChaptersPromises = chapterFileNames
    .map(async chapterFileName => ({
      id: chapterFileName,
      metaContent: await metaContentByChapterName[chapterFileName],
      diffContent: await readFile(
        path.join(directories.diff, chapterFileName + '.diff')
      )
    }))
    .map(async chapterGenerationInputInfoPromise =>
      generateChapter(await chapterGenerationInputInfoPromise)
    )
    .map(async chapterGenerationPromise => {
      const generationResult = await chapterGenerationPromise

      const markdownFilePath = path.join(
        directories.output,
        generationResult.chapterId + '.md'
      )

      const metaFilePath = path.join(
        directories.meta,
        generationResult.chapterId + '.md'
      )

      if (!generationResult.success) {
        await writeFile(markdownFilePath, generationResult.error.toString())
        return {
          success: generationResult.success,
          chapterId: generationResult.chapterId,
          error: generationResult.error,
          markdownFilePath,
          metaFilePath
        }
      }

      const { success, chapterId, chapterContent, metaContent } = generationResult

      const writeMarkdownPromise = writeFile(markdownFilePath, chapterContent)
      const writeMetaPromise = writeFile(metaFilePath, metaContent)

      await Promise.all([writeMarkdownPromise, writeMetaPromise])

      return { success, chapterId, markdownFilePath, metaFilePath }
    })

  const metaAssetsCopyingPromises = (await metaFilesFolder.getAssetsRelativePath()).map(
    async assetPath => {
      const srcFilePath = path.join(directories.meta, assetPath)
      const destFilePath = path.join(directories.output, assetPath)
      await createDir(path.dirname(destFilePath))
      return copyFile(srcFilePath, destFilePath).then(() => assetPath)
    }
  )

  const $resultsView = $ResultsView({
    chapterGenerationPromises: generateAndWriteChaptersPromises,
    metaAssetsCopyingPromises
  })

  $resultsView.render()
}
