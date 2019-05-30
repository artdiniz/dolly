import path from 'path'

import { html as code, oneLineTrim } from 'common-tags'

import { resolvePathFromCwd } from 'utils/path/resolvePathFromCwd'

import { generateChapter, IFailedResult } from 'generator/generateChapter'
import { createDir, readDir, readFile, writeFile } from 'utils/fs'

import chalk from 'chalk'
import { biggest } from 'utils/reducers/biggest'

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

  const generateChapterPromises = chapterIds.map(chapterId =>
    generateChapter({
      id: chapterId,
      intro: readFile(path.join(directories.intro, chapterId + '.md')),
      diff: readFile(path.join(directories.diff, chapterId + '.diff'))
    })
  )

  const biggestChapterId = chapterIds.reduce(biggest)

  const writeChaptersToFileSystemPromise = Promise.all(
    generateChapterPromises.map(async generationPromise => {
      const { success, id, content } = await generationPromise

      const outputFilePath = path.join(directories.output, id + '.md')
      await writeFile(outputFilePath, content.toString())

      return { success, chapterId: id, outputFilePath }
    })
  )

  const writeResults = await writeChaptersToFileSystemPromise

  writeResults.forEach(({ success, chapterId, outputFilePath }) => {
    const paddedChapterIdForLogs = chapterId.padEnd(biggestChapterId.length + 2, ' ')
    if (success) {
      console.log(oneLineTrim`
        ${chalk.bold.green('Success')} ${paddedChapterIdForLogs} ${outputFilePath}
      `)
    } else {
      console.error(
        chalk.bold.red(oneLineTrim`
          ${chalk.bgRed.white(' Error ')} ${paddedChapterIdForLogs} ${outputFilePath}
        `)
      )
    }
  })

  const errors = (await Promise.all(generateChapterPromises))
    .filter((res): res is IFailedResult => !res.success)
    .map(res => res.content)

  if (errors.length) {
    const errorTitle = (number: Number) =>
      code`
        ***************
        ==  Error ${number}  ==
        ***************
      `

    const errorMessage = errors
      .map(
        (error, position) => code`
          ${chalk.bold.red(errorTitle(position + 1))}

            ${chalk.red(error.message)}
        `
      )
      .join('\n\n===\n\n')

    console.error('\n\n' + errorMessage + '\n\n')
  }
}
