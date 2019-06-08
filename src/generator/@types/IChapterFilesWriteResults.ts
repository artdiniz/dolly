interface IWithSuccess {
  success: boolean
}

interface IWithChapterOutputInfo {
  chapterId: string
  markdownFilePath: string
  metaFilePath: string
}

export interface IFailedWriteResult extends IWithSuccess, IWithChapterOutputInfo {
  success: false
  error: Error
}

export interface ISuccessfulWriteResult
  extends IWithSuccess,
    IWithChapterOutputInfo {
  success: true
}

export type IChapterFilesWriteResults = IFailedWriteResult | ISuccessfulWriteResult
