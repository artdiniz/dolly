import { IHydratedMetaStepsItem } from '.'

export interface IExerciseChapter {
  title: string
  objective: string
  steps: IHydratedMetaStepsItem[]
}
