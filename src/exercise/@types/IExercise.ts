import { IExerciseStepsItem } from '.'

export interface IExerciseChapter {
  title: string
  objective: string
  steps: IExerciseStepsItem[]
}
