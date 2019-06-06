export interface IExerciseItemCodeChange {
  statement?: string
  filePath: string
  codeLanguage: string
  code: string
}

export interface IExerciseItemWithStatement {
  position?: number
  statement: string
}

export interface IExerciseItemWithCodeChanges extends IExerciseItemWithStatement {
  codeChanges: IExerciseItemCodeChange[]
}

export type IExerciseStepsItem =
  | IExerciseItemWithStatement
  | IExerciseItemWithCodeChanges
