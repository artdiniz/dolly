import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import { resolvePathFromCwd } from 'pathUtils/resolvePathFromCwd'
import { createPath } from 'pathUtils/resolveAndCreatePathFromCwd'

import { toExerciseChapter } from 'exercise/chapter'
import { toChapterMarkdown } from 'exercise/markdown'

process.on('unhandledRejection', (error, rejectedPromise) => {
  console.error('Unhandled Rejection at:', rejectedPromise, 'reason:', error)
  process.exit(1)
})

const diffFilesDirArg = process.argv.slice(2)[0]
const outputDirArg = process.argv.slice(2)[1]

const diffFilesDir = resolvePathFromCwd(diffFilesDirArg)

if (diffFilesDir === null) {
  throw new Error(`Provided diff files dir is empty`)
} else {
  const outputDirCreation = createPath(resolvePathFromCwd(outputDirArg) || path.resolve(diffFilesDir, '../dolly'))

  console.log('Lendo:', diffFilesDir)
  const files = fs
    .readdirSync(diffFilesDir)
    .filter(fileName => path.extname(fileName) === '.diff')
    .map(fileName => path.join(diffFilesDir, fileName))

  Promise.all(
    files.map(filePath => {
      const chapterFileName = path.basename(filePath).replace(/\.diff$/, '')

      return promisify(fs.readFile)(filePath)
        .then(fileBuffer => fileBuffer.toString())
        .then(content => toExerciseChapter(content))
        .then(exerciseChapter => toChapterMarkdown(exerciseChapter))
        .then(markdown =>
          outputDirCreation.then(outputDir => {
            const markdownFilePath = path.join(outputDir, chapterFileName + '.md')
            return promisify(fs.writeFile)(markdownFilePath, markdown).then(() => markdownFilePath)
          })
        )
        .then(markdownFilePath => console.log('Finished: ' + markdownFilePath))
    })
  )
}
