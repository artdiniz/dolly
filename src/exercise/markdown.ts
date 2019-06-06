import { html as code } from 'common-tags'
import { IExerciseChapter, IExerciseStepsItem } from 'exercise/@types'

export function toExerciseStepMarkdown(item: IExerciseStepsItem): string {
  const statement = `${item.position}. ${item.statement}`
  if ('codeChanges' in item) {
    return code`
      ${statement}

          ${item.codeChanges
            .map(
              change => code`
                ${change.statement || ''}

                ###### # ${change.filePath}
                \`\`\`${change.codeLanguage}
                ${change.code.trim()}
                \`\`\`
              `
            )
            .join('\n\n')}
    `
  } else {
    return statement
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
    .map(item => toExerciseStepMarkdown(item))
    .join('\n\n')
    .trim()

  return introMarkdown + '\n\n' + exerciseItemsMarkdown + '\n'
}
