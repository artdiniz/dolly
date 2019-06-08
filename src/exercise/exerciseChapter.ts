import { html as code } from 'common-tags'

import { IExerciseChapter } from 'exercise/@types'
import { toExerciseSteps } from 'exercise/exerciseSteps'

export function toExerciseChapter(
  meta: string,
  diff: string
): IExerciseChapter | Error {
  const [title, objective] = meta.split(/^----*$/gm)

  if (!title || !objective) {
    return Error(code`
      Invalid intro:
      \`\`\`
      ${meta}
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
      \`\`\`
    `)
  }

  const stepByStepItems = toExerciseSteps(diff)

  if (stepByStepItems instanceof Error) {
    return stepByStepItems
  }

  return {
    title: title.trim(),
    objective: objective.trim(),
    steps: stepByStepItems
  }
}
