import { html as code } from 'common-tags'

import { IExerciseStep } from 'exercise/stepByStep/@types'
import { DiffParseFunction } from 'exercise/stepByStep/diffParsers/@types'

import { parseGitDiff } from 'exercise/stepByStep/diffParsers/gitDiffParser'
import { parseFluxoDiff } from 'exercise/stepByStep/diffParsers/fluxoDiffParser'

export function toExerciseSteps(chapterDiff: string): IExerciseStep[] | Error {
  const individualDiffs = chapterDiff.split(/^(diff --.*)/gm).slice(1)

  const steps: IExerciseStep[] = []

  for (let i = 0; i < individualDiffs.length; i = i + 2) {
    const rawDif = {
      header: individualDiffs[i],
      body: individualDiffs[i + 1]
    }

    const diffHeaderTypeMatch = rawDif.header.match(/^diff --(.+?)[\s]/)
    const diffType = diffHeaderTypeMatch && diffHeaderTypeMatch[1]

    if (diffType === null) return new Error('pode não')

    const parseFunctions: { [key: string]: DiffParseFunction | undefined } = {
      git: parseGitDiff,
      fluxo: parseFluxoDiff
    }

    const parseFunction = parseFunctions[diffType]

    if (parseFunction === undefined) {
      return Error(code`
        Invalid diff type: ${diffType}
        Diff Header: 
          ${rawDif.header}
        Diff Body: 
          ${rawDif.body}          
      `)
    }

    const parsedSteps = parseFunction(rawDif)
    if (parsedSteps instanceof Error) return parsedSteps
    steps.push(...parsedSteps)
  }

  return steps
}
