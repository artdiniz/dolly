import { IHydratedExerciseStepsItem } from '.'

export interface IExerciseChapter {
  title: string
  objective: string
  steps: IHydratedExerciseStepsItem[]
}
