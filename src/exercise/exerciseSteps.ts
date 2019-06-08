import { html as code } from 'common-tags'
import _isError from 'lodash/isError'
import _not from 'lodash/negate'
import _partition from 'lodash/partition'

import { IChange } from 'changes/@types'
import { IExerciseStepsItem, IUnhydratedExerciseStepsItems } from 'exercise/@types'

import { gitDiffParser } from 'changes/diffParsers/gitDiffParser'
import { fluxoDiffParser } from 'changes/diffParsers/fluxoDiffParser'
import * as parsersByName from 'exercise/changeParsers'

function convertDiffToChangesPerStep(chapterDiff: string): IChange[][] | Error {
  const individualDiffs = chapterDiff.split(/^(diff .*)/gm).slice(1)

  const changesPerStep: IChange[][] = []

  for (let i = 0; i < individualDiffs.length; i = i + 2) {
    const rawDif = {
      header: individualDiffs[i],
      body: individualDiffs[i + 1]
    }

    const diffHeaderTypeMatch = rawDif.header.match(/^diff --(.+?)[\s]/)
    const diffType = diffHeaderTypeMatch && diffHeaderTypeMatch[1]

    if (diffType === null) {
      return new Error(code`
        Can't parse diff without a type

        A diff without a type (e.g. \`--git\`) isn't valid.
        Invalid diff header:
          ${rawDif.header}
      `)
    }

    const validParser = [gitDiffParser, fluxoDiffParser].find(parser =>
      parser.shouldParse(diffType)
    )

    if (validParser === undefined) {
      return Error(code`
        Can't parse unknown diff type: ${diffType}
        
        Invalid diff header: 
          ${rawDif.header}
      `)
    }

    const parsedSteps = validParser.parse(rawDif)
    if (parsedSteps instanceof Error) return parsedSteps
    changesPerStep.push(parsedSteps)
  }

  return changesPerStep
}

const isChangeList = function(
  result: Error | IChange[] | IExerciseStepsItem
): result is IChange[] {
  return Array.isArray(result)
}

const isExerciseItems = (
  item: Error | IChange[] | IExerciseStepsItem
): item is IExerciseStepsItem => _not(_isError)(item) && _not(isChangeList)(item)

export function toExerciseSteps(
  chapterDiff: string
): IUnhydratedExerciseStepsItems[] | Error {
  const changesPerStep = convertDiffToChangesPerStep(chapterDiff)
  if (changesPerStep instanceof Error) return changesPerStep

  const parsers = Object.values(parsersByName)

  const parsedChanges = changesPerStep.map((changes, stepNumber) => {
    const parser = parsers.find(_parser => _parser.shouldParse(changes))
    return parser !== undefined ? parser.parse(changes, stepNumber + 1) : changes
  })

  const [exerciseItems, fails] = _partition(parsedChanges, isExerciseItems)

  if (exerciseItems.length > 0) {
    return exerciseItems
  } else {
    const parseError = fails.find(_isError)
    if (parseError) return parseError

    const changesWithNoParser = fails.find(isChangeList)
    if (changesWithNoParser) {
      return new Error(code`
        No parser found that can convert those diff changes to an exercise item:
  
        ${changesWithNoParser.map(change =>
          JSON.stringify({
            type: change.type,
            file: 'filePath' in change ? change.filePath : change.newFilePath,
            hasCode: 'code' in change
          })
        )}
      `)
    }

    throw new Error("This shouldn't hapen")
  }
}
