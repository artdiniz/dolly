import { IExerciseChapter, IExerciseStepsItem } from 'exercise/@types'
import { toExerciseSteps } from 'exercise/exerciseSteps'
import { readMetaMarkdown } from './metaMarkdown'
import { hashExerciseStep } from './hashExerciseStep'

function isStepEquals(a: IExerciseStepsItem, b: IExerciseStepsItem) {
  return hashExerciseStep(a) === hashExerciseStep(b)
}

export function toExerciseChapter(
  meta: string,
  diff: string
): IExerciseChapter | Error {
  const metaInfo = readMetaMarkdown(meta)
  if (metaInfo instanceof Error) return metaInfo
  const { title, objective, steps: metaStepByStepItems } = metaInfo

  const diffStepByStepItems = toExerciseSteps(diff)
  if (diffStepByStepItems instanceof Error) {
    return diffStepByStepItems
  }

  const diffOnlySteps = diffStepByStepItems.filter(
    diffStep =>
      !metaStepByStepItems.find(metaStep => isStepEquals(diffStep, metaStep))
  )

  const steps = [...metaStepByStepItems, ...diffOnlySteps]

  return {
    title: title.trim(),
    objective: objective.trim(),
    steps: steps
  }
}
