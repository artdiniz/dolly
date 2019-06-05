export interface IChangeWithCode {
  codeLanguage: string
  code: string
}

export interface IChangeMaintainedFileName {
  filePath: string
}

export interface IChangeRenamedFile {
  oldFilePath: string
  newFilePath: string
}

export interface IChangeRenamedOnlyFile extends IChangeRenamedFile {
  type: 'renamedOnly'
}

export interface IChangeRenamedModifiedFile extends IChangeRenamedFile {
  type: 'renamedAndModified'
}

export interface IChangeDeletedFile extends IChangeMaintainedFileName {
  type: 'deleted'
}

export interface IChangeAddedFile extends IChangeMaintainedFileName {
  type: 'added'
}

export interface IChangeModifiedFile extends IChangeMaintainedFileName {
  type: 'modified'
}

export type IChangeDeletedFileWithCode = IChangeWithCode & IChangeDeletedFile
export type IChangeAddedFileWithCode = IChangeWithCode & IChangeAddedFile
export type IChangeModifiedFileWithCode = IChangeWithCode & IChangeModifiedFile
export type IChangeRenamedModifiedFileWithCode = IChangeWithCode &
  IChangeRenamedModifiedFile

export type IChangeFile =
  | IChangeModifiedFile
  | IChangeAddedFile
  | IChangeDeletedFile
  | IChangeRenamedOnlyFile
  | IChangeRenamedModifiedFile

export type IChangeFileWithCode =
  | IChangeDeletedFileWithCode
  | IChangeAddedFileWithCode
  | IChangeModifiedFileWithCode
  | IChangeRenamedModifiedFileWithCode

export type IChange = IChangeFile | IChangeFileWithCode
