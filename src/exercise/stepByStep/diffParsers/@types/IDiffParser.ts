import { IRawDiffItem } from '.'
import { IExerciseStep } from 'exercise/stepByStep/@types'

export interface IDiffParser {
  shouldParse(diffType: string): boolean
  parse(rawDiff: IRawDiffItem): IExerciseStep[] | Error
}
