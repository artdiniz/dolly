import { html as code } from 'common-tags'
import {
  IExerciseChapter,
  IExerciseStepsItem,
  IExerciseItemCodeChange,
  IExerciseItemChange,
  IHydratedExerciseStepsItem
} from 'exercise/@types'

function isCodeChange(
  change: IExerciseItemChange
): change is IExerciseItemCodeChange {
  return 'code' in change
}

export function toExerciseStepMarkdown(item: IHydratedExerciseStepsItem): string {
  const stepDeadStatus = item.isDead ? '[Faleceu]' : ''
  const statement = `${item.position}. ${stepDeadStatus}${item.statement}`

  const codeChangesMarkdown = item.changes.filter(isCodeChange).map(change => {
    return code`
      ${change.statement || ''}

      ###### # ${change.filePath}
      \`\`\`${change.codeLanguage}
      ${change.code.trim()}
      \`\`\`
    `
  })

  if (codeChangesMarkdown.length > 0) {
    return code`
      ${statement}
      
          ${codeChangesMarkdown.join('\n\n')}
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
