import path from 'path'

import { html as code } from 'common-tags'

import { IExerciseCodeStep } from 'exercise/codeStep'
import { IExerciseChapter } from 'exercise/chapter'

export function toCodeStepMarkdown(
  item: IExerciseCodeStep,
  itemNumber: number
): string {
  return code`
    ${itemNumber}. ${item.statement}

      ####### ${item.fileName}

      \`\`\`${item.codeLanguage}
      ${code(item.code).trim()}
      \`\`\`
  `
}

export function toChapterMarkdown(exerciseChapter: IExerciseChapter): string {
  const introMarkdown = code`
        # Exercício: ${exerciseChapter.title}

        ## Objetivo

        ${exerciseChapter.objective}

        ## Passo a passo com código
    `

  const exerciseItemsMarkdown = exerciseChapter.steps
    .map((item, itemNumber) => toCodeStepMarkdown(item, itemNumber + 1))
    .join('\n\n')

  return introMarkdown.trim() + '\n\n' + exerciseItemsMarkdown.trim()
}
