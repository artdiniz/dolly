import { html as code } from 'common-tags'

import {
  IExerciseChapter,
  IExerciseItemChange,
  IHydratedMetaStepsItem,
  IDehydratedMetaStepsItem,
  IMetaStepStatus,
  IMetaStepsItem
} from 'exercise/@types'

interface IMetaMarkdown {
  title: string
  objective: string
  steps: IDehydratedMetaStepsItem[]
}

function InvalidMetaIntroContentError(metaContent: string) {
  return new Error(code`
    Invalid Intro in meta content:
    \`\`\`
    ${metaContent}
    \`\`\`
    
    Intro must be in the format:
    \`\`\`
    Title dolore cillum occaecat non aliquip.
    ---
    Objective lorem laborum dolor officia eiusmod exercitation nostrud. 
    Fugiat labore aliqua laborum voluptate sit velit ut. 
    Id occaecat Lorem veniam culpa dolor sint enim consectetur nulla eu pariatur fugiat. 
    Nostrud tempor velit mollit eu ut tempor qui adipisicing et non exercitation. 
    Aute ea nisi non et veniam eiusmod. Ut ex aute duis non esse quis nisi. 
    Commodo sit amet velit sit dolor sunt est aute irure quis enim adipisicing consectetur.
    ---
    \`\`\`
  `)
}
interface IMetaStepsItemHeader {
  hash: IMetaStepsItem['hash']
  status: IMetaStepsItem['status']
}

const headerInfoSeparator = '|'

function toMdStepHeader(info: string) {
  return `#=============== ⬇${info}⬇`
}

function toMdStepHeaderWith({ hash, status }: IMetaStepsItemHeader): string {
  if (status === 'old') {
    return toMdStepHeader(` ${hash} `)
  }
  return toMdStepHeader(` ${hash} ${headerInfoSeparator} ${status} `)
}

const mdChangeItemHeading = '#######'

const mdEmptyChangeStatement = 'no-sub-statement'

function toMdChangeItem(change: IExerciseItemChange): string {
  const statementPadding = ''.padStart(mdChangeItemHeading.length, ' ')
  return code`
    ${mdChangeItemHeading} ${change.type} - ${change.filePath}
    ${statementPadding} ${change.statement || mdEmptyChangeStatement}
  `
}

function isValidStatus(status: string): status is IMetaStepStatus {
  return status === 'new' || status === 'old' || status === 'dead'
}

function parseMetaMarkdownSteps(
  stringSteps: string
): IDehydratedMetaStepsItem[] | Error {
  const metaSteps: IDehydratedMetaStepsItem[] = []
  if (stringSteps) {
    const splitStepsRegExp = new RegExp(toMdStepHeader('(.*)'), 'gm')
    const splittedSteps = stringSteps.split(splitStepsRegExp).slice(1)
    for (let i = 0; i < splittedSteps.length; i = i + 2) {
      const header = splittedSteps[i]
      const [hash, status = 'old'] = header
        .split(headerInfoSeparator)
        .map(info => info.trim())
      const stepStatementAndChanges = splittedSteps[i + 1]

      if (status !== undefined && !isValidStatus(status))
        return Error(`Invalid exercise step status ${status} in meta file`)

      const splitStatementAndChangesRegExp = new RegExp(
        '^([\\s\\S]+?)\\n{1,2}[\\s]*(' + mdChangeItemHeading + '[\\s\\S]+)',
        'gm'
      )

      const statementAndChangesSplit = stepStatementAndChanges
        .split(splitStatementAndChangesRegExp)
        .filter(str => str.trim())

      if (statementAndChangesSplit.length !== 2) {
        return new Error(code`
          Invalid exercise step in meta file:

            \`\`\`
            ${stepStatementAndChanges}
            \`\`\`
        `)
      }

      const [statement, changesString] = statementAndChangesSplit

      if (!statement) return new Error('Invalid Statement')

      const changesMatchRegExp = new RegExp(
        mdChangeItemHeading + '\\s(.+)\\s\\-\\s(.+)\\n[\\s]*(.+)',
        'gm'
      )
      const splittedChanges = changesString.split(changesMatchRegExp)
      if (splittedChanges.length === 1)
        return new Error(code`
          Invalid changes in meta file:

            \`\`\`
            ${changesString}
            \`\`\`
        `)

      const changes: IExerciseItemChange[] = []
      const filteredChangesSplit = splittedChanges.filter(str => str.trim())
      for (let j = 0; j < filteredChangesSplit.length; j = j + 3) {
        const type = filteredChangesSplit[j]
        const path = filteredChangesSplit[j + 1]
        const changeStatement =
          filteredChangesSplit[j + 2] !== mdEmptyChangeStatement
            ? filteredChangesSplit[j + 2]
            : undefined

        changes.push({
          type,
          filePath: path,
          statement: changeStatement
        })
      }

      metaSteps.push({
        isHydrated: false,
        hash,
        status: status,
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
  if (!title || !objective) return InvalidMetaIntroContentError(metaContent)

  const metaSteps = parseMetaMarkdownSteps(stringSteps)
  if (metaSteps instanceof Error) return metaSteps

  return {
    title,
    objective,
    steps: metaSteps
  }
}

function toStepsMetaMarkdown(steps: IHydratedMetaStepsItem[]): string[] {
  return steps.map(step => {
    const stepChangesMarkdown = step.changes.map(change => toMdChangeItem(change))

    return code`
      ${toMdStepHeaderWith({ hash: step.hash, status: step.status })}

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
