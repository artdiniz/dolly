export interface IExerciseItemFileChange {
  type: string
  statement?: string
  filePath: string
}

export interface IExerciseItemCodeChange extends IExerciseItemFileChange {
  codeLanguage: string
  code: string
}

export type IExerciseItemChange = IExerciseItemFileChange | IExerciseItemCodeChange

export interface IExerciseStepsItem {
  position?: number
  statement: string
  changes: IExerciseItemChange[]
}

export interface IMetaStepsItem extends IExerciseStepsItem {
  hash: string
}

export interface IHydratedExerciseStepsItem extends IExerciseStepsItem {
  isDead: boolean
}

export type IUnhydratedExerciseStepsItems = IExerciseStepsItem | IMetaStepsItem
