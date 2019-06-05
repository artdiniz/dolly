import { html as code } from 'common-tags'
import { IExerciseChapter, IExerciseStepsItem } from 'exercise/@types'

export function toCodeStepMarkdown(item: IExerciseStepsItem): string {
  if ('codeChanges' in item) {
    return code`
      ${item.position}. ${item.statement}

      ${item.codeChanges
        .map(
          change => code`
            ####### ${change.filePath}
      
            \`\`\`${change.codeLanguage}
            ${code(change.code).trim()}
            \`\`\`          
          `
        )
        .join('\n\n')}
    `
  } else {
    return code`
      ${item.position}. ${item.statement}
    `
  }
}

export function toChapterMarkdown(exerciseChapter: IExerciseChapter): string {
  const introMarkdown = code`
        # Exercício: ${exerciseChapter.title}

        ## Objetivo

        ${exerciseChapter.objective}

        ## Passo a passo com código
    `

  const exerciseItemsMarkdown = exerciseChapter.steps
    .map(item => toCodeStepMarkdown(item))
    .join('\n\n')

  return introMarkdown.trim() + '\n\n' + exerciseItemsMarkdown.trim()
}
