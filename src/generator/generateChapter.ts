import { html as code } from 'common-tags'

import { toExerciseChapter } from 'exercise/chapter'
import { toChapterMarkdown } from 'exercise/markdown'

export interface ISuccesfullResult {
  success: true
  content: string
  id: string
}

export interface IFailedResult {
  success: false
  content: Error
  id: string
}

export type IChapterGenerationResult = ISuccesfullResult | IFailedResult

interface IChapterGenerationInputInfo {
  id: string
  intro: string | Promise<string>
  diff: string | Promise<string>
}

export async function generateChapter(
  chapterInfo: IChapterGenerationInputInfo
): Promise<IChapterGenerationResult> {
  const [introContent, diffContent] = await Promise.all([
    chapterInfo.intro,
    chapterInfo.diff
  ])

  const exerciseChapter = toExerciseChapter(introContent, diffContent)

  if (exerciseChapter instanceof Error) {
    const error = exerciseChapter
    error.message = code`
        Couldn't generate exercise chapter for: ${chapterInfo.id}

        ${error.message}
    `
    return { success: false, content: error, id: chapterInfo.id }
  }

  const markdownContent = toChapterMarkdown(exerciseChapter)

  return { success: true, content: markdownContent, id: chapterInfo.id }
}
