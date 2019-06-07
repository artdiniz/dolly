import path from 'path'

import { html as code, oneLineTrim, stripIndent } from 'common-tags'
import chalk from 'chalk'
import _partition from 'lodash/partition'

import { resolvePathFromCwd } from 'utils/path/resolvePathFromCwd'
import { biggestStringIn } from 'utils/reducers/biggestString'
import { createDir, readDir, readFile, writeFile } from 'utils/fs'

import { bootstrapMetaFiles } from 'metaFiles/bootstrapMetaFiles'
import { generateChapter } from 'generator/generateChapter'

process.on('unhandledRejection', (error: Error) => {
  console.error('Unhandled Rejection. Reason:')
  console.error(error)
  process.exit(1)
})

const cliArgs = process.argv.slice(2)
const diffFilesDirArg = cliArgs[0]
const introFilesDirArg = cliArgs[1]
const outputDirArg = cliArgs[2]

const diffDir = diffFilesDirArg
  ? resolvePathFromCwd(diffFilesDirArg)
  : resolvePathFromCwd('./dolly/diffs')

run({
  diff: diffDir,
  meta: introFilesDirArg
    ? resolvePathFromCwd(introFilesDirArg)
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

  const diffFilesId = (await readDir(directories.diff))
    .filter(fileName => path.extname(fileName) === '.diff')
    .map(diffFileName => path.basename(diffFileName).replace(/\.diff$/, ''))

  const metaFiles = bootstrapMetaFiles({
    path: directories.meta,
    chapterIds: diffFilesId
  })

  const metaFilesContentByChapterId = await metaFiles.readFilesContent()

  const generateAndWriteChaptersPromise = Promise.all(
    diffFilesId
      .map(async chapterId => ({
        id: chapterId,
        metaContent: await metaContentByChapterId[chapterId],
        diffContent: await readFile(path.join(directories.diff, chapterId + '.diff'))
      }))
      .map(async chapterGenerationInputInfoPromise =>
        generateChapter(await chapterGenerationInputInfoPromise)
      )
      .map(async chapterGenerationPromise => {
        const { success, chapterId, chapterContent } = await chapterGenerationPromise

        const outputFilePath = path.join(directories.output, chapterId + '.md')
        await writeFile(outputFilePath, chapterContent.toString())

        return { success, chapterId, chapterContent, outputFilePath }
      })
  )

  const writeResults = await generateAndWriteChaptersPromise

  const [successfulResults, failedResults] = _partition(
    writeResults,
    result => result.success
  )

  const chapterIdPaddingLength = biggestStringIn(chaptersIds).length + 2

  const successMessages = successfulResults
    .map(result => ({
      ...result,
      chapterId: result.chapterId.padEnd(chapterIdPaddingLength, ' ')
    }))
    .map(
      result => oneLineTrim`
        ${chalk.bold.green('Success')} ${result.chapterId} ${result.outputFilePath}
      `
    )

  const failMessages = failedResults
    .map(result => ({
      ...result,
      chapterId: result.chapterId.padEnd(chapterIdPaddingLength, ' ')
    }))
    .map(result =>
      chalk.bold.red(oneLineTrim`
        ${chalk.bgRed.white(' Error ')} ${result.chapterId} ${result.outputFilePath}
      `)
    )

  const boxTextView = (text: string) => {
    const boxLine = ''.padStart(8 + text.length, '*')
    return stripIndent`
      ${boxLine}
      ==  ${text}  ==
      ${boxLine}
    `
  }

  const errorBoxView = (text: string) => chalk.bold.red(boxTextView(text))

  const detailedErrors = failedResults
    .map(
      ({ chapterContent: error }, position) => code`
        ${errorBoxView(`Error ${position + 1}`)}

            ${chalk.red(error.toString())}
      `
    )
    .join('\n\n===\n\n')

  console.log('\n')

  if (successMessages.length) {
    console.log(code`
      ${successMessages}
    `)
    console.log('\n')
  }

  if (failedResults.length) {
    console.error(code`
      ${failMessages}
      
      ${detailedErrors}
    `)
    console.log('\n')
  }
}
