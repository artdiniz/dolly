import { html as code, oneLineTrim, stripIndent } from 'common-tags'
import chalk from 'chalk'
import _partition from 'lodash/partition'

import { IChapterGenerationResults } from 'generator/@types'
import { biggestStringIn } from 'utils/reducers/biggestString'

function renderChapters(generatedChapters: IChapterGenerationResults[]) {
  const [successfulResults, failedResults] = _partition(
    generatedChapters,
    result => result.success
  )

  const chapterFileNames = generatedChapters.map(info => info.chapterId)

  const chapterIdPaddingLength = biggestStringIn(chapterFileNames).length + 2

  const successMessages = successfulResults
    .map(result => ({
      ...result,
      chapterId: result.chapterId.padEnd(chapterIdPaddingLength, ' ')
    }))
    .map(
      result => oneLineTrim`
            ${chalk.bold.green('Success')} ${result.chapterId} ${
        result.outputFilePath
      }
          `
    )

  const failMessages = failedResults
    .map(result => ({
      ...result,
      chapterId: result.chapterId.padEnd(chapterIdPaddingLength, ' ')
    }))
    .map(result =>
      chalk.bold.red(oneLineTrim`
            ${chalk.bgRed.white(' Error ')} ${result.chapterId} ${
        result.outputFilePath
      }
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

interface IResultsViewArgs {
  chapterGenerationPromises: Promise<IChapterGenerationResults>[]
}

export function $ResultsView({ chapterGenerationPromises }: IResultsViewArgs) {
  async function render() {
    const generatedChapters = await Promise.all(chapterGenerationPromises)
    renderChapters(generatedChapters)
  }

  return {
    render
  }
}
