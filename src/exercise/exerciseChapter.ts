import {
  IExerciseChapter,
  IExerciseStepsItem,
  IHydratedMetaStepsItem,
  IMetaStepsItem,
  IDehydratedMetaStepsItem,
  IExerciseItemChange
} from 'exercise/@types'

import { toExerciseSteps } from 'exercise/exerciseSteps'
import { readMetaMarkdown } from 'exercise/metaMarkdown'
import { hashExerciseStep } from 'exercise/hashExerciseStep'

function areStepsTheSame(a: IMetaStepsItem, b: IExerciseStepsItem) {
  return a.hash === hashExerciseStep(b)
}

function hyDrateAsNewMetaStep(step: IExerciseStepsItem): IHydratedMetaStepsItem {
  return Object.assign({}, step, {
    isHydrated: true as true,
    status: 'not_approved' as 'not_approved',
    hash: hashExerciseStep(step)
  })
}

function hydrateAsDeadMetaStep(
  step: IDehydratedMetaStepsItem
): IHydratedMetaStepsItem {
  return Object.assign({}, step, {
    isHydrated: true as true,
    status: 'dead' as 'dead',
    hash: step.hash
  })
}

function mergeChanges(
  metaStep: IMetaStepsItem,
  diffStep: IExerciseStepsItem
): IExerciseItemChange[] {
  const metaChanges = metaStep.changes
  const diffChanges = diffStep.changes

  return diffChanges.map((diffChange, change_position) => {
    const metaStatement = metaChanges[change_position].statement
    return {
      ...diffChange,
      statement: metaStatement !== undefined ? metaStatement : diffChange.statement
    }
  })
}

function mergeAndHydrateSteps(
  metaStep: IDehydratedMetaStepsItem,
  diffStep: IExerciseStepsItem
): IHydratedMetaStepsItem {
  return {
    hash: hashExerciseStep(diffStep),
    status: metaStep.status === 'ok' ? 'ok' : 'not_approved',
    isHydrated: true,
    statement: metaStep.statement,
    position: metaStep.position,
    changes: mergeChanges(metaStep, diffStep)
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
  if (diffStepByStepItems instanceof Error) return diffStepByStepItems

  const mergedAndUnmergeableMetaSteps = metaStepByStepItems.map(metaStep => {
    const relativeDiffStep = diffStepByStepItems.find(diffStep =>
      areStepsTheSame(metaStep, diffStep)
    )

    if (relativeDiffStep === undefined) {
      return hydrateAsDeadMetaStep(metaStep)
    } else {
      return mergeAndHydrateSteps(metaStep, relativeDiffStep)
    }
  })

  const diffOnlySteps = diffStepByStepItems
    .filter(
      diffStep =>
        !metaStepByStepItems.find(metaStep => areStepsTheSame(metaStep, diffStep))
    )
    .map(hyDrateAsNewMetaStep)

  const steps = [...mergedAndUnmergeableMetaSteps, ...diffOnlySteps]

  return {
    title: title.trim(),
    objective: objective.trim(),
    steps: steps
  }
}
