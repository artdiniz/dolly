import path from 'path'
import { html as code } from 'common-tags';

export interface IExerciseCodeStep {
  statement: string
  fileName: string
  codeLanguage: string
  code: string
}

export function toExerciseCodeSteps(diff: string): IExerciseCodeStep[] | Error {
  const splittedDiff = diff.split(/^diff --(.*)/gm).slice(1)

  const steps: IExerciseCodeStep[] = []

  for (let i = 0; i < splittedDiff.length; i = i + 2) {
    const diffSignature = splittedDiff[i].trim()
    const diffBody = splittedDiff[i + 1].trim()

    const diffSignatureTypeMatch = diffSignature.match(/^(.+?)[\s]/)
    const diffType = diffSignatureTypeMatch && diffSignatureTypeMatch[1]


    if (diffType === 'git') {
      diffBody
    } else if (diffType === 'fluxo') {
      diffBody
    } else {
      return Error(code`
        Invalid diff signature: ${diffSignature}

          Unknown diff type: ${diffType}
      `)
    }

    steps.push({
      statement: 'TODO Enunciado do item',
      fileName: 'TODO ' + diffSignature,
      codeLanguage: path.extname(diffSignature).replace(/^\./, ''),
      code: diffBody
    })
  }

  return steps
}
