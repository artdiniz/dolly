interface IWithChapterOutputInfo {
  success: boolean
  chapterId: string
  markdownFilePath: string
  metaFilePath: string
}

export interface IFailedWriteResult extends IWithChapterOutputInfo {
  success: false
  error: Error
}

export interface ISuccessfulWriteResult extends IWithChapterOutputInfo {
  success: true
}

export type IChapterFilesWriteResult = IFailedWriteResult | ISuccessfulWriteResult
