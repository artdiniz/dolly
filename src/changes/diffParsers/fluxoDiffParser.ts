import { html as code } from 'common-tags'

import { IRawDiffItem, IDiffParser } from 'changes/diffParsers/@types'
import { IChange, IChangeFile } from 'changes/@types'

function toStepType(diffType: 'A' | 'D'): 'added' | 'deleted' {
  if (diffType === 'A') return 'added'
  else if (diffType === 'D') return 'deleted'
  else throw new Error(`Invalid difftype ${diffType}`)
}

function shouldParse(diffType: string) {
  return diffType === 'fluxo'
}

function parseFluxoDiff({ header, body }: IRawDiffItem): IChange[] | Error {
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

  const changes: IChange[] = []
  const fluxoFileType = headerDiffFileTypeMatch[1]

  if (fluxoFileType === 'change_only_files') {
    const changeOnlyFilesMatch = body.match(/^([AD]\t.+)/gm)
    if (changeOnlyFilesMatch === null) {
      return Error(code`
        Invalid empty "change_only_files" diff
      `)
    }

    const parsedSteps = changeOnlyFilesMatch.map(typeAndFile => {
      const [modType, filePath] = typeAndFile.split('\t') as [('A' | 'D'), string]
      return {
        type: toStepType(modType),
        filePath: filePath
      } as IChangeFile
    })

    changes.push(...parsedSteps)
  }
  return changes
}

export const fluxoDiffParser: IDiffParser = {
  parse: parseFluxoDiff,
  shouldParse
}
