import { html as code } from 'common-tags'

import { toExerciseChapter } from 'exercise/exerciseChapter'
import { toChapterMarkdown } from 'exercise/markdown'
import { toChapterMetaMarkdown } from 'exercise/metaMarkdown'

interface ISuccesfullResult {
  success: true
  chapterId: string
  chapterContent: string
  metaContent: string
}

interface IFailedResult {
  success: false
  error: Error
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
  const { metaContent: initialMetaContent, diffContent, id: chapterId } = chapterInfo

  const exerciseChapter = toExerciseChapter(initialMetaContent, diffContent)

  if (exerciseChapter instanceof Error) {
    const error = exerciseChapter
    error.message = code`
        Couldn't generate exercise chapter for: ${chapterId}

        ${error.message}
    `

    return {
      success: false,
      error,
      chapterId: chapterInfo.id
    }
  }

  const markdownContent = toChapterMarkdown(exerciseChapter)
  const metaContent = toChapterMetaMarkdown(exerciseChapter)

  return {
    success: true,
    chapterContent: markdownContent,
    metaContent: metaContent,
    chapterId: chapterInfo.id
  }
}
