export interface IExStepWithCode {
  codeLanguage: string
  code: string
}

export interface IExerciseStepMaintainedFileName {
  filePath: string
}

export interface IExerciseStepRenamedFile {
  oldFilePath: string
  newFilePath: string
}

export interface IExStepRenamedOnlyFile extends IExerciseStepRenamedFile {
  type: 'renamedOnly'
}

export interface IExStepRenamedModifiedFile extends IExerciseStepRenamedFile {
  type: 'renamedAndModified'
}

export interface IExStepDeletedFile extends IExerciseStepMaintainedFileName {
  type: 'deleted'
}

export interface IExStepAddedFile extends IExerciseStepMaintainedFileName {
  type: 'added'
}

export interface IExStepModifiedFile extends IExerciseStepMaintainedFileName {
  type: 'modified'
}

export type IExStepModifiedCode = IExStepWithCode & IExStepModifiedFile
export type IExStepAddedCode = IExStepWithCode & IExStepAddedFile
export type IExStepDeletedCode = IExStepWithCode & IExStepDeletedFile
export type IExStepRenamedModifiedCode = IExStepWithCode & IExStepRenamedModifiedFile

export type IExerciseWithCodeStep =
  | IExStepModifiedCode
  | IExStepAddedCode
  | IExStepDeletedCode
  | IExStepRenamedModifiedCode

export type IExerciseWithoutCodeStep =
  | IExStepModifiedFile
  | IExStepAddedFile
  | IExStepDeletedFile
  | IExStepRenamedModifiedFile
  | IExStepRenamedOnlyFile

export type IExerciseStep = IExerciseWithCodeStep | IExerciseWithoutCodeStep
