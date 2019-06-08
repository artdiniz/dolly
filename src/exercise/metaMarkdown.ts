import { html as code } from 'common-tags'

import { IExerciseChapter, IExerciseStepsItem } from 'exercise/@types'

function toStepsMetaMarkdown(steps: IExerciseStepsItem[]): string {
  return ''
}

export function toChapterMetaMarkdown(exerciseChapter: IExerciseChapter): string {
  const chapterStepsMarkdown = toStepsMetaMarkdown(exerciseChapter.steps)
  chapterStepsMarkdown
  return code`
    ${exerciseChapter.title}
    ---
    ${exerciseChapter.objective}
   `
}
