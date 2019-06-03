import { html as code } from 'common-tags'

import { IExerciseStep } from 'exercise/stepByStep/@types'

import { gitDiffParser } from 'exercise/stepByStep/diffParsers/gitDiffParser'
import { fluxoDiffParser } from 'exercise/stepByStep/diffParsers/fluxoDiffParser'

export function toExerciseSteps(chapterDiff: string): IExerciseStep[] | Error {
  const individualDiffs = chapterDiff.split(/^(diff .*)/gm).slice(1)

  const steps: IExerciseStep[] = []

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
    steps.push(...parsedSteps)
  }

  return steps
}
