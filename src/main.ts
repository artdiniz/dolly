import path from 'path'

import { resolvePathFromCwd } from 'utils/path/resolvePathFromCwd'
import { createDir, readDir, readFile, copyFiles } from 'utils/fs'

import { MetaFilesFolder } from 'metaFiles/MetaFilesFolder'
import { $ResultsView } from 'view/$ResultsView'

import { generateChapter } from 'generator/generateChapter'
import { writeGenerationResultToFileSystem } from 'generator/writeGenerationResultToFileSystem'

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

export interface IArgDirectories {
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

  const metaAssetsCopyingPromises = copyFiles({
    files: await metaFilesFolder.getAssetsRelativePath(),
    from: directories.meta,
    to: directories.output
  })

  const metaInfoByChapterName = await metaFilesFolder.getMetaInfoByChapterName(
    chapterFileNames
  )

  const generateAndWriteChaptersPromises = chapterFileNames
    .map(async chapterFileName => ({
      id: chapterFileName,
      metaContent: await metaInfoByChapterName[chapterFileName],
      diffContent: await readFile(
        path.join(directories.diff, chapterFileName + '.diff')
      )
    }))
    .map(async chapterGenerationInputInfoPromise =>
      generateChapter(await chapterGenerationInputInfoPromise)
    )
    .map(async chapterGenerationPromise =>
      writeGenerationResultToFileSystem(await chapterGenerationPromise, directories)
    )

  const $resultsView = $ResultsView({
    chapterGenerationPromises: generateAndWriteChaptersPromises,
    metaAssetsCopyingPromises
  })

  $resultsView.render()
}
