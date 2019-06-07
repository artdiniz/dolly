export interface IChapterGenerationResults {
  success: boolean
  chapterId: string
  chapterContent: string | Error
  outputFilePath: string
}
