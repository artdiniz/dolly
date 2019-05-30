import path from 'path'

import { html as code, oneLineTrim, stripIndent } from 'common-tags'

import { resolvePathFromCwd } from 'utils/path/resolvePathFromCwd'
import { biggest } from 'utils/reducers/biggest'

import { generateChapter } from 'generator/generateChapter'
import { createDir, readDir, readFile, writeFile } from 'utils/fs'

import chalk from 'chalk'

interface IArgDirectories {
  diff: string
  intro: string
  output: string
}

process.on('unhandledRejection', (error, rejectedPromise) => {
  console.error('Unhandled Rejection at:', rejectedPromise, 'reason:', error)
  process.exit(1)
})

const cliArgs = process.argv.slice(2)
const diffFilesDirArg = cliArgs[0]
const introFilesDirArg = cliArgs[1]
const outputDirArg = cliArgs[2]

if (diffFilesDirArg === null) {
  throw new Error(`Provided diff files dir is empty`)
} else if (introFilesDirArg === null) {
  throw new Error(`Provided intro files dir is empty`)
} else {
  run({
    diff: resolvePathFromCwd(diffFilesDirArg),
    intro: resolvePathFromCwd(introFilesDirArg),
    output: outputDirArg
      ? resolvePathFromCwd(outputDirArg)
      : path.resolve(resolvePathFromCwd(diffFilesDirArg), '../generated')
  })
}

async function run(directories: IArgDirectories) {
  await createDir(directories.output)

  const chapterIds = (await readDir(directories.diff))
    .filter(fileName => path.extname(fileName) === '.diff')
    .map(diffFileName => path.basename(diffFileName).replace(/\.diff$/, ''))

  const generateAndWriteChaptersPromise = Promise.all(
    chapterIds
      .map(async chapterId => ({
        id: chapterId,
        introContent: await readFile(
          path.join(directories.intro, chapterId + '.md')
        ),
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
  const successfulResults = writeResults.filter(result => result.success)
  const failedResults = writeResults.filter(result => !result.success)

  const chapterIdPaddingLength = chapterIds.reduce(biggest).length + 2

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
