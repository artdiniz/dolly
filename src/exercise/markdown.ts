import { html as code } from 'common-tags'

import { IExerciseStep, IExerciseWithCodeStep } from 'exercise/exerciseStep'
import { IExerciseChapter } from 'exercise/chapter'
export function toCodeStepMarkdown(
  item: IExerciseWithCodeStep,
  itemNumber: number
): string {
  if (item.type === 'added' || item.type === 'deleted' || item.type === 'modified') {
    return code`
      ${itemNumber}. TODO Enunciado ADM
  
        ####### ${item.filePath}
  
        \`\`\`${item.codeLanguage}
        ${code(item.code).trim()}
        \`\`\`
    `
  } else if (item.type === 'renamedAndModified') {
    return code`
      ${itemNumber}. TODO Enunciado Rename
  
        ####### ${item.newFilePath}
  
        \`\`\`${item.codeLanguage}
        ${code(item.code).trim()}
        \`\`\`
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
    .map((item, itemNumber) => toCodeStepMarkdown(item, itemNumber + 1))
    .join('\n\n')

  return introMarkdown.trim() + '\n\n' + exerciseItemsMarkdown.trim()
}
