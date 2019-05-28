import { IExerciseCodeStep, toExerciseCodeSteps } from 'exercise/codeStep'

export interface IExerciseChapter {
  title: string
  objective: string
  steps: IExerciseCodeStep[]
}

export function toExerciseChapter(intro: string, diff: string): IExerciseChapter {
  const [title, objective] = intro.split(/^----*$/gm)

  const stepByStepCodeItems = toExerciseCodeSteps(diff)
  const steps =
    stepByStepCodeItems instanceof Error
      ? (console.error(stepByStepCodeItems), [])
      : stepByStepCodeItems

  return {
    title: title.trim() || 'TODO Fallback título do exercício',
    objective: objective.trim() || 'TODO Fallback objetivo do exercício',
    steps
  }
}
