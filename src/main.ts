import { resolvePathFromCwd } from 'resolvePathFromCwd'

import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import { html } from 'common-tags'

const code = html

interface IExerciseItem {
  statement: string
  fileName: string
  code: string
}

interface IExerciseChapter {
  title: string
  objective: string
  items: IExerciseItem[]
}

function toExerciseChapter(diff: string): IExerciseChapter {
  diff
  return {
    title: 'Exercício show',
    objective:
      'Lorem magna sint dolore magna nulla cupidatat non magna aliquip eiusmod ut.',
    items: [
      {
        statement:
          'Officia consectetur ut ad eu deserunt consectetur ullamco irure esse fugiat. Excepteur tempor cupidatat non proident nulla reprehenderit aliquip. Velit laborum culpa laborum velit quis magna deserunt laboris aliquip mollit. Aliqua fugiat reprehenderit labore deserunt ut et non. Cupidatat et nisi dolor ex et pariatur ex adipisicing. Ut in ullamco voluptate eu. Laborum enim pariatur esse mollit voluptate ullamco.',
        fileName: 'test/show/hang_loose.js',
        code: code`
          function alo(param: tipoShow) {
            return param.show()
          }
        `
      },
      {
        statement:
          'Officia consectetur ut ad eu deserunt consectetur ullamco irure esse fugiat. Excepteur tempor cupidatat non proident nulla reprehenderit aliquip. Velit laborum culpa laborum velit quis magna deserunt laboris aliquip mollit. Aliqua fugiat reprehenderit labore deserunt ut et non. Cupidatat et nisi dolor ex et pariatur ex adipisicing. Ut in ullamco voluptate eu. Laborum enim pariatur esse mollit voluptate ullamco.',
        fileName: 'test/show/mini_hang_loose.js',
        code: code`
          function sinais(param: tipoShow) {
            return param.show()
          }
        `
      }
    ]
  }
}

function toItemMarkdown(item: IExerciseItem, itemNumber: number): string {
  return code`
    ${itemNumber}. ${item.statement}

     ###### # ${item.fileName}

     \`\`\`${path.extname(item.fileName).replace(/^\./, '')}
     ${item.code.trim()}
     \`\`\`
  `
}

function toChapterMarkdown(exerciseChapter: IExerciseChapter): string {
  const introMarkdown = code`
    # ${exerciseChapter.title}

    ## Objetivo

    ${exerciseChapter.objective}

    ## Passo a passo com código
  `

  const exerciseItemsMarkdown = exerciseChapter.items
    .map((item, itemNumber) => toItemMarkdown(item, itemNumber + 1))
    .join('\n\n')

  return introMarkdown.trim() + '\n\n' + exerciseItemsMarkdown.trim()
}

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
          return promisify(fs.writeFile)(markdownFilePath, markdown).then(
            () => markdownFilePath
          )
        })
        .then(markdownFilePath => console.log('Finished: ' + markdownFilePath))
    })
  )
}
