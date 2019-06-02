import { html as code } from 'common-tags'

import { IRawDiffItem } from 'exercise/stepByStep/diffParsers/@types'
import { IExerciseStep } from 'exercise/stepByStep/@types'

export function parseFluxoDiff({
  header,
  body
}: IRawDiffItem): IExerciseStep[] | Error {
  const steps: IExerciseStep[] = []

  const fluxoDiffFileTypes = ['change_only_files']

  const headerDiffFileTypeMatch = header.match(/^diff --fluxo a\/(.+) b\/(.+)/)

  const invalidFileType =
    (headerDiffFileTypeMatch !== null &&
      headerDiffFileTypeMatch[1] !== headerDiffFileTypeMatch[2]) ||
    (headerDiffFileTypeMatch !== null &&
      !fluxoDiffFileTypes.includes(headerDiffFileTypeMatch[1]) &&
      !fluxoDiffFileTypes.includes(headerDiffFileTypeMatch[2]))

  if (headerDiffFileTypeMatch === null || invalidFileType) {
    return new Error(code`
        Invalid diff header:
          ${header}
  
        Valid --fluxo headers are: 
          ${fluxoDiffFileTypes.map(
            fileType => `diff --fluxo a/${fileType} b/${fileType}`
          )}
      `)
  }

  const fluxoFileType = headerDiffFileTypeMatch[1]

  if (fluxoFileType === 'change_only_files') {
    const changeOnlyFilesMatch = body.match(/^([AD]\t.+)/gm)
    if (!changeOnlyFilesMatch) {
      return Error(code`
          Invalid empty "change_only_files" diff
        `)
    }

    changeOnlyFilesMatch.map(typeAndFile => {
      const [modType, filePath] = typeAndFile.split('\t')
      return {
        type: modType,
        filePath: filePath
      }
    })
  }
  return steps
}
