import { ICodeLine } from 'changes/@types'

export interface IExerciseItemFileChange {
  type: string
  statement?: string
  filePath: string
}

export interface IExerciseItemCodeChange extends IExerciseItemFileChange {
  codeLanguage: string
  code: ICodeLine[]
}

export type IExerciseItemChange = IExerciseItemFileChange | IExerciseItemCodeChange

export interface IExerciseStepsItem {
  position?: number
  statement: string
  changes: IExerciseItemChange[]
}

export type IMetaStepStatus = 'new' | 'old' | 'dead'

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
