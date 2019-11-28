import { html as code, oneLineTrim, stripIndent } from 'common-tags'
import chalk from 'chalk'
import _partition from 'lodash/partition'

import {
  IChapterFilesWriteResult,
  ISuccessfulWriteResult,
  IFailedWriteResult
} from 'generator/@types'

import { biggestStringIn } from 'utils/reducers/biggestString'

function renderChapters(generatedChapters: IChapterFilesWriteResult[]) {
  const [successfulResults, failedResults] = _partition(
    generatedChapters,
    result => result.success
  ) as [ISuccessfulWriteResult[], IFailedWriteResult[]]

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
        result.markdownFilePath
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
        result.markdownFilePath
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
      ({ error }, position) => code`
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

function renderAssets(assetsPaths: string[]) {
  const paths = assetsPaths.map(
    assetPath => code`
      • ${chalk.grey(assetPath)}
    `
  )

  console.log(code`
    Copied ${paths.length} asset from meta:
    
      ${paths}
  `)
}

interface IResultsViewArgs {
  chapterGenerationPromises: Promise<IChapterFilesWriteResult>[]
  metaAssetsCopyingPromise: Promise<Promise<string>[]>
}

export function $ResultsView({
  chapterGenerationPromises,
  metaAssetsCopyingPromise: metaAssetsCopyingPromises
}: IResultsViewArgs) {
  async function render() {
    const generatedChapters = await Promise.all(chapterGenerationPromises)
    const copiedAssets = await Promise.all(await metaAssetsCopyingPromises)
    renderAssets(copiedAssets)
    renderChapters(generatedChapters)
  }

  return {
    render
  }
}
