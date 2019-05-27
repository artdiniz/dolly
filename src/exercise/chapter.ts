import { IExerciseItem } from 'exercise/item'

export interface IExerciseChapter {
  title: string
  objective: string
  items: IExerciseItem[]
}

export function toExerciseChapter(diff: string): IExerciseChapter {
  diff
  return {
    title: 'Exercício show',
    objective: 'Lorem magna sint dolore magna nulla cupidatat non magna aliquip eiusmod ut.',
    items: [
      {
        statement:
          'Officia consectetur ut ad eu deserunt consectetur ullamco irure esse fugiat. Excepteur tempor cupidatat non proident nulla reprehenderit aliquip. Velit laborum culpa laborum velit quis magna deserunt laboris aliquip mollit. Aliqua fugiat reprehenderit labore deserunt ut et non. Cupidatat et nisi dolor ex et pariatur ex adipisicing. Ut in ullamco voluptate eu. Laborum enim pariatur esse mollit voluptate ullamco.',
        fileName: 'test/show/hang_loose.js',
        code: `
          function alo(param: tipoShow) {
              return param.show()
          }
        `
      },
      {
        statement:
          'Officia consectetur ut ad eu deserunt consectetur ullamco irure esse fugiat. Excepteur tempor cupidatat non proident nulla reprehenderit aliquip. Velit laborum culpa laborum velit quis magna deserunt laboris aliquip mollit. Aliqua fugiat reprehenderit labore deserunt ut et non. Cupidatat et nisi dolor ex et pariatur ex adipisicing. Ut in ullamco voluptate eu. Laborum enim pariatur esse mollit voluptate ullamco.',
        fileName: 'test/show/mini_hang_loose.js',
        code: `
          function sinais(param: tipoShow) {
              return param.show()
          }
        `
      }
    ]
  }
}
