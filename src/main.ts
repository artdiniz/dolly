import { resolvePathFromCwd } from 'resolvePathFromCwd'

import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { toExerciseChapter } from 'exercise/chapter'
import { toChapterMarkdown } from 'exercise/markdown'

process.on('unhandledRejection', (error, rejectedPromise) => {
  console.error('Unhandled Rejection at:', rejectedPromise, 'reason:', error)
  process.exit(1)
})

const argsDir = resolvePathFromCwd(process.argv.slice(2)[0])

if (argsDir === null) {
  throw new Error('Provided path is empty')
} else {
  console.log('Lendo:', argsDir)
  const files = fs
    .readdirSync(argsDir)
    .filter(fileName => path.extname(fileName) === '.diff')
    .map(fileName => path.join(argsDir, fileName))

  Promise.all(
    files.map(filePath => {
      const chapterFileName = path.basename(filePath).replace(/\.diff$/, '')

      return promisify(fs.readFile)(filePath)
        .then(fileBuffer => fileBuffer.toString())
        .then(content => toExerciseChapter(content))
        .then(exerciseChapter => toChapterMarkdown(exerciseChapter))
        .then(markdown => {
          const markdownFilePath = path.join(argsDir, chapterFileName + '.md')
          return promisify(fs.writeFile)(markdownFilePath, markdown).then(() => markdownFilePath)
        })
        .then(markdownFilePath => console.log('Finished: ' + markdownFilePath))
    })
  )
}
