import { html as code } from 'common-tags'

import { IExerciseChapter, IExerciseStepsItem } from 'exercise/@types'

function toStepsMetaMarkdown(steps: IExerciseStepsItem[]): string[] {
  return steps.map(step => {
    const stepHash = '43g576d'
    const stepChangesMarkdown = step.changes.map(
      change => code`
      ####### ${change.type} - ${change.filePath}
              ${change.statement || 'sem sub-enunciado'}
      `
    )

    return code`
      #=============== ⬇ ${stepHash} ⬇

      ${step.statement}
      
         ${stepChangesMarkdown.join('\n')}
    `
  })
}

export function toChapterMetaMarkdown(exerciseChapter: IExerciseChapter): string {
  const chapterStepsMarkdown = toStepsMetaMarkdown(exerciseChapter.steps).join(
    '\n\n\n\n\n'
  )
  chapterStepsMarkdown
  return code`
    ${exerciseChapter.title}
    ---
    ${exerciseChapter.objective}
    ${chapterStepsMarkdown ? '---\n\n\n' : ''}
    ${chapterStepsMarkdown || ''}
   `
}
