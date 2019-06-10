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

export type IMetaStepStatus = 'ok' | 'dead' | 'not_approved'

export interface IMetaStepsItem extends IExerciseStepsItem {
  hash: string
  status: IMetaStepStatus
  isHydrated: boolean
}

export interface IDehydratedMetaStepsItem extends IMetaStepsItem {
  isHydrated: false
}

export interface IHydratedMetaStepsItem extends IMetaStepsItem {
  isHydrated: true
}
