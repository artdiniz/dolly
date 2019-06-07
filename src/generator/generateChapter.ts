import { html as code } from 'common-tags'

import { toExerciseChapter } from 'exercise/exerciseChapter'
import { toChapterMarkdown } from 'exercise/markdown'

export interface ISuccesfullResult {
  success: true
  chapterContent: string
  chapterId: string
}

export interface IFailedResult {
  success: false
  chapterContent: Error
  chapterId: string
}

export type IChapterGenerationResult = ISuccesfullResult | IFailedResult

interface IChapterGenerationInputInfo {
  id: string
  metaContent: string
  diffContent: string
}

export function generateChapter(
  chapterInfo: IChapterGenerationInputInfo
): IChapterGenerationResult {
  const { metaContent: introContent, diffContent, id: chapterId } = chapterInfo

  const exerciseChapter = toExerciseChapter(introContent, diffContent)

  if (exerciseChapter instanceof Error) {
    const error = exerciseChapter
    error.message = code`
        Couldn't generate exercise chapter for: ${chapterId}

        ${error.message}
    `
    return { success: false, chapterContent: error, chapterId }
  }

  const markdownContent = toChapterMarkdown(exerciseChapter)

  return { success: true, chapterContent: markdownContent, chapterId }
}
