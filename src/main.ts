import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import { html as code } from 'common-tags'
import chalk from 'chalk'

import { resolvePathFromCwd } from 'pathUtils/resolvePathFromCwd'
import { createPath } from 'pathUtils/resolveAndCreatePathFromCwd'

import { toExerciseChapter } from 'exercise/chapter'
import { toChapterMarkdown } from 'exercise/markdown'

process.on('unhandledRejection', (error, rejectedPromise) => {
  console.error('Unhandled Rejection at:', rejectedPromise, 'reason:', error)
  process.exit(1)
})

const diffFilesDirArg = process.argv.slice(2)[0]
const introFilesDirArg = process.argv.slice(2)[1]
const outputDirArg = process.argv.slice(2)[2]

const diffFilesDir = resolvePathFromCwd(diffFilesDirArg)
const introFilesDir = resolvePathFromCwd(introFilesDirArg)

if (diffFilesDir === null) {
  throw new Error(`Provided diff files dir is empty`)
} else if (introFilesDir === null) {
  throw new Error(`Provided intro files dir is empty`)
} else {
  const outputDirCreation = createPath(
    resolvePathFromCwd(outputDirArg) || path.resolve(diffFilesDir, '../generated')
  )

  console.log('Lendo:', diffFilesDir)
  const allChaptersFiles = fs
    .readdirSync(diffFilesDir)
    .filter(fileName => path.extname(fileName) === '.diff')
    .map(diffFileName => {
      const chapterFileName = path.basename(diffFileName).replace(/\.diff$/, '')
      return {
        chapterFileName,
        introFileName: path.join(introFilesDir, chapterFileName + '.md'),
        diffFileName: path.join(diffFilesDir, diffFileName)
      }
    })

  const biggestChapterNameLength = allChaptersFiles
    .map(chapter => chapter.chapterFileName)
    .reduce(
      (_chapterNameLength, name) =>
        name.length > _chapterNameLength ? name.length : _chapterNameLength,
      0
    )

  Promise.all(
    allChaptersFiles.map(chapterFiles => {
      const writeFile = promisify(fs.writeFile)
      const readFile = promisify(fs.readFile)

      const readIntroAndDiff = Promise.all([
        readFile(chapterFiles.introFileName),
        readFile(chapterFiles.diffFileName)
      ])

      const paddedChapterNameForLogs = chapterFiles.chapterFileName.padEnd(
        biggestChapterNameLength + 2,
        ' '
      )

      return readIntroAndDiff
        .then(([introFileBuffer, diffFileBuffer]) => [
          introFileBuffer.toString(),
          diffFileBuffer.toString()
        ])
        .then(([introContent, diffContent]) => {
          const chapter = toExerciseChapter(introContent, diffContent)

          if (chapter instanceof Error) {
            const error = chapter
            error.message = code`
              Couldn't generate exercise chapter for: ${chapterFiles.chapterFileName}

              ${error.message}
            `
            throw error
          }

          return chapter
        })
        .then(exerciseChapter => toChapterMarkdown(exerciseChapter))
        .catch(error =>
          outputDirCreation.then(outputDir => {
            const markdownFilePath = path.join(outputDir, chapterFiles.chapterFileName + '.md')
            return writeFile(markdownFilePath, error).then(() => Promise.reject(markdownFilePath))
          })
        )
        .then(markdown =>
          outputDirCreation.then(outputDir => {
            const markdownFilePath = path.join(outputDir, chapterFiles.chapterFileName + '.md')
            return writeFile(markdownFilePath, markdown).then(() => markdownFilePath)
          })
        )
        .then(markdownFilePath =>
          console.log(chalk.green('Success ') + paddedChapterNameForLogs + markdownFilePath)
        )
        .catch(markdownFilePath =>
          console.log(
            chalk.bgRed.white(' Error ') +
              ' ' +
              chalk.red(paddedChapterNameForLogs + markdownFilePath)
          )
        )
    })
  )
}
