import { IExerciseChapter, IExerciseStepsItem } from 'exercise/@types'
import { toExerciseSteps } from 'exercise/exerciseSteps'
import { readMetaMarkdown, IMetaStepsItem } from 'exercise/metaMarkdown'
import { hashExerciseStep } from 'exercise/hashExerciseStep'

function isStepEquals(a: IMetaStepsItem, b: IExerciseStepsItem) {
  return a.hash === hashExerciseStep(b)
}

function hydrateMetaStepWithDiffChanges(
  metaStep: IMetaStepsItem,
  diffStep?: IExerciseStepsItem
): IExerciseStepsItem {
  return {
    statement: metaStep.statement,
    position: metaStep.position,
    changes: diffStep === undefined ? [] : diffStep.changes
  }
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

  const hydratedMetaSteps = metaStepByStepItems.map(metaStep => {
    const equalDiffStep = diffStepByStepItems.find(diffStep =>
      isStepEquals(metaStep, diffStep)
    )
    return hydrateMetaStepWithDiffChanges(metaStep, equalDiffStep)
  })

  const diffOnlySteps = diffStepByStepItems.filter(
    diffStep =>
      !metaStepByStepItems.find(metaStep => isStepEquals(metaStep, diffStep))
  )

  const steps = [...hydratedMetaSteps, ...diffOnlySteps]

  return {
    title: title.trim(),
    objective: objective.trim(),
    steps: steps
  }
}
