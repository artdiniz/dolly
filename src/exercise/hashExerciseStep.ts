import hash from 'object-hash'
import { IExerciseStepsItem } from 'exercise/@types'

export function hashExerciseStep(step: IExerciseStepsItem) {
  return hash(step.changes, {
    unorderedArrays: true,
    unorderedSets: true,
    unorderedObjects: true,
    respectType: false
  }).substring(0, 7)
}
