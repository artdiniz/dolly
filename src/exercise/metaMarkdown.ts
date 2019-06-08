import { html as code } from 'common-tags'

import {
  IExerciseChapter,
  IExerciseStepsItem,
  IMetaStepsItem,
  IExerciseItemChange
} from 'exercise/@types'
import { hashExerciseStep } from 'exercise/hashExerciseStep'

interface IMetaMarkdown {
  title: string
  objective: string
  steps: IMetaStepsItem[]
}

function InvalidMetaContentError(metaContent: string) {
  return new Error(code`
    Invalid Meta Content:
    \`\`\`
    ${metaContent}
    \`\`\`
    
    Meta Content must be in the format:
    \`\`\`
    Title dolore cillum occaecat non aliquip.
    ---
    Objective lorem laborum dolor officia eiusmod exercitation nostrud. 
    Fugiat labore aliqua laborum voluptate sit velit ut. 
    Id occaecat Lorem veniam culpa dolor sint enim consectetur nulla eu pariatur fugiat. 
    Nostrud tempor velit mollit eu ut tempor qui adipisicing et non exercitation. 
    Aute ea nisi non et veniam eiusmod. Ut ex aute duis non esse quis nisi. 
    Commodo sit amet velit sit dolor sunt est aute irure quis enim adipisicing consectetur.
    \`\`\`
  `)
}

function toMdStepHash(hash: string): string {
  return `#=============== ⬇ ${hash} ⬇`
}

const mdChangeItemHeading = '#######'

function toMdChangeItem(change: IExerciseItemChange): string {
  const statementPadding = ''.padStart(mdChangeItemHeading.length, ' ')
  return code`
    ${mdChangeItemHeading} ${change.type} - ${change.filePath}
    ${statementPadding} ${change.statement || 'sem sub-enunciado'}
  `
}

function parseMetaMarkdownSteps(stringSteps: string): IMetaStepsItem[] | Error {
  const metaSteps: IMetaStepsItem[] = []
  if (stringSteps) {
    const splitStepsRegExp = new RegExp(toMdStepHash('(.{7})'), 'gm')
    const splittedSteps = stringSteps.split(splitStepsRegExp).slice(1)
    for (let i = 0; i < splittedSteps.length; i = i + 2) {
      console.log('######')
      const hash = splittedSteps[i]
      const content = splittedSteps[i + 1]

      const splitStatementAndChangesRegExp = new RegExp(
        '^([\\s\\S]+?)\\n{1,2}[\\s]*(' + mdChangeItemHeading + '[\\s\\S]+)',
        'gm'
      )

      const statementAndChangesSplit = content
        .split(splitStatementAndChangesRegExp)
        .filter(str => str.trim())

      if (statementAndChangesSplit.length !== 2)
        return new Error('Invalid Meta Step')

      const [statement, changesString] = statementAndChangesSplit

      if (!statement) return new Error('Invalid Statement')

      const changesMatchRegExp = new RegExp(
        mdChangeItemHeading + '\\s(.+)\\s\\-\\s(.+)\\n[\\s]*(.+)',
        'gm'
      )
      const splittedChanges = changesString.split(changesMatchRegExp)
      if (splittedChanges.length === 1) throw new Error('Invalid Changes')

      const changes: IExerciseItemChange[] = []
      const filteredChangesSplit = splittedChanges.filter(str => str.trim())
      for (let j = 0; j < filteredChangesSplit.length; j = j + 3) {
        const type = filteredChangesSplit[i]
        const path = filteredChangesSplit[i + 1]
        const changeStatement = filteredChangesSplit[i + 2]

        console.log(type, path, changeStatement)

        changes.push({
          type,
          filePath: path,
          statement: changeStatement
        })
      }

      metaSteps.push({
        hash,
        statement: statement.trim(),
        position: i / 2 + 1,
        changes
      })
    }
  }

  return metaSteps
}

export function readMetaMarkdown(metaContent: string): IMetaMarkdown | Error {
  const [title, objective, stringSteps] = metaContent.split(/^----*$/gm)
  if (!title || !objective) return InvalidMetaContentError(metaContent)

  const metaSteps = parseMetaMarkdownSteps(stringSteps)
  if (metaSteps instanceof Error) return metaSteps

  return {
    title,
    objective,
    steps: metaSteps
  }
}

function toStepsMetaMarkdown(steps: IExerciseStepsItem[]): string[] {
  return steps.map(step => {
    const stepHash = hashExerciseStep(step)
    const stepChangesMarkdown = step.changes.map(change => toMdChangeItem(change))

    return code`
      ${toMdStepHash(stepHash)}

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
