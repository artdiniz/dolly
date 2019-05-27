import path from 'path'

import { html } from 'common-tags'

import { IExerciseItem } from 'exercise/item'
import { IExerciseChapter } from 'exercise/chapter'

const code = html

export function toItemMarkdown(item: IExerciseItem, itemNumber: number): string {
  return code`
    ${itemNumber}. ${item.statement}

      ####### ${item.fileName}

      \`\`\`${path.extname(item.fileName).replace(/^\./, '')}
      ${code(item.code).trim()}
      \`\`\`
  `
}

export function toChapterMarkdown(exerciseChapter: IExerciseChapter): string {
  const introMarkdown = code`
        # ${exerciseChapter.title}

        ## Objetivo

        ${exerciseChapter.objective}

        ## Passo a passo com código
    `

  const exerciseItemsMarkdown = exerciseChapter.items
    .map((item, itemNumber) => toItemMarkdown(item, itemNumber + 1))
    .join('\n\n')

  return introMarkdown.trim() + '\n\n' + exerciseItemsMarkdown.trim()
}
