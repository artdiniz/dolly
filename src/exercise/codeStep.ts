export interface IExerciseCodeStep {
  statement: string
  fileName: string
  code: string
}

export function toExerciseCodeSteps(diff: string): IExerciseCodeStep[] | Error {
  const splittedDiff = diff.split(/^diff --(.*)/gm).slice(1)

  const steps: IExerciseCodeStep[] = []

  for (let i = 0; i < splittedDiff.length; i = i + 2) {
    const diffSignature = splittedDiff[i].trim()
    const diffBody = splittedDiff[i + 1].trim()

    const diffSignatureGitMatch = diffSignature.match(/^git /)
    const diffSignatureFluxoMatch = diffSignature.match(/^fluxo /)

    if (diffSignatureGitMatch) {
      diffBody
    } else if (diffSignatureFluxoMatch) {
      diffBody
    } else {
      return Error(`Invalid diff signature: ${diffSignature}`)
    }

    steps.push({
      statement: 'TODO Enunciado do item',
      fileName: 'TODO ' + diffSignature,
      code: diffBody
    })
  }

  return steps
}
