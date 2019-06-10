import { html as code } from 'common-tags'
import {
  IExerciseChapter,
  IExerciseItemCodeChange,
  IExerciseItemChange,
  IHydratedMetaStepsItem
} from 'exercise/@types'
import { ICodeLine } from 'changes/@types'

function isCodeChange(
  change: IExerciseItemChange
): change is IExerciseItemCodeChange {
  return 'code' in change
}

function strike(text: string, canStrike = (char: string) => true): string {
  return text
    .split('')
    .map(char => (canStrike(char) ? char + '\u0336' : char))
    .join('')
}

function strikeAll(text: string): string {
  return strike(text)
}

function strikeNonWhitespaceOnly(text: string): string {
  return strike(text, (char: string) => Boolean(char.match(/\S/)))
}

export function toCodeChangeMarkdown(codeChange: ICodeLine[]): string {
  let previousLine: ICodeLine
  return codeChange
    .map(line => {
      if (line.type === 'added') {
        return (previousLine = line), `+${line.content}`
      }

      if (line.type === 'deleted') {
        return (previousLine = line), `-${strikeNonWhitespaceOnly(line.content)}`
      }

      if (line.type === 'context') {
        if (
          previousLine &&
          previousLine.type === 'context' &&
          previousLine.content.trim().length === 0 &&
          line.content.trim().length === 0
        ) {
          return (previousLine = line), null
        } else {
          return (previousLine = line), ` ${line.content}`
        }
      }
    })
    .filter(line => line !== null)
    .join('\n')
}

export function toExerciseStepMarkdown(item: IHydratedMetaStepsItem): string {
  const statement = `${item.position}. ${item.statement}`

  const codeChangesMarkdown = item.changes.filter(isCodeChange).map(change => {
    return code`
      ${change.statement || ''}

      ###### # ${change.filePath}
      \`\`\`${change.codeLanguage}
      ${toCodeChangeMarkdown(change.code)}
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
