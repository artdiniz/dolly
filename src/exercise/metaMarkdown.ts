import { html as code } from 'common-tags'

import { IExerciseChapter, IExerciseStepsItem } from 'exercise/@types'
import { hashExerciseStep } from 'exercise/hashExerciseStep'

export interface IMetaStepsItem extends IExerciseStepsItem {
  hash: string
}

interface IMetaMarkdown {
  title: string
  objective: string
  steps: IMetaStepsItem[]
}

export function readMetaMarkdown(metaContent: string): IMetaMarkdown | Error {
  const [title, objective, stringSteps] = metaContent.split(/^----*$/gm)
  stringSteps

  if (!title || !objective) {
    return Error(code`
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

  return {
    title,
    objective,
    steps: []
  }
}

function toStepsMetaMarkdown(steps: IExerciseStepsItem[]): string[] {
  return steps.map(step => {
    const stepHash = hashExerciseStep(step)
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
