import { IChange } from 'changes/@types'
import { IExerciseStepsItem } from 'exercise/@types'

export interface IChangeToExerciseItemParser<T extends IChange> {
  shouldParse(changes: IChange[]): changes is T[]
  parse(changes: IChange[], itemPosition?: number): IExerciseStepsItem | Error
}
