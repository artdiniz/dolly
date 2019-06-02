import path from 'path'

import { html as code } from 'common-tags'
import { parse as parseDiff } from 'what-the-diff'

export interface IExStepWithCode {
  codeLanguage: string
  code: string
}

export interface IExerciseStepMaintainedFileName {
  filePath: string
}

export interface IExerciseStepRenamedFile {
  oldFilePath: string
  newFilePath: string
}

export interface IExStepRenamedOnlyFile extends IExerciseStepRenamedFile {
  type: 'renamedOnly'
}

export interface IExStepRenamedModifiedFile extends IExerciseStepRenamedFile {
  type: 'renamedAndModified'
}

export interface IExStepDeletedFile extends IExerciseStepMaintainedFileName {
  type: 'deleted'
}

export interface IExStepAddedFile extends IExerciseStepMaintainedFileName {
  type: 'added'
}

export interface IExStepModifiedFile extends IExerciseStepMaintainedFileName {
  type: 'modified'
}

export type IExStepModifiedCode = IExStepWithCode & IExStepModifiedFile
export type IExStepAddedCode = IExStepWithCode & IExStepAddedFile
export type IExStepDeletedCode = IExStepWithCode & IExStepDeletedFile
export type IExStepRenamedModifiedCode = IExStepWithCode & IExStepRenamedModifiedFile

export type IExerciseWithCodeStep =
  | IExStepModifiedCode
  | IExStepAddedCode
  | IExStepDeletedCode
  | IExStepRenamedModifiedCode

export type IExerciseWithoutCodeStep =
  | IExStepModifiedFile
  | IExStepAddedFile
  | IExStepDeletedFile
  | IExStepRenamedModifiedFile
  | IExStepRenamedOnlyFile

export type IExerciseStep = IExerciseWithCodeStep | IExerciseWithoutCodeStep

interface IRawDiffItem {
  header: string
  body: string
}

function parseGitDiff({ header, body }: IRawDiffItem): IExerciseStep[] | Error {
  const diffs = parseDiff(header + body)

  if (diffs.length > 1) {
    return new Error(code`
      Diff parsing failed. Only single diffs are supported but you provded ${
        diffs.length
      } ${diffs.length === 1 ? 'diff' : 'diffs'}
    `)
  }

  const gitDiff = diffs[0]

  const steps: IExerciseStep[] = []

  if (gitDiff.status === 'deleted') {
    steps.push({
      type: 'deleted',
      filePath: toFilePath(gitDiff.oldPath),
      codeLanguage: toLanguageIdentifier(gitDiff.oldPath),
      code: toCode(gitDiff.hunks)
    })
  } else if (gitDiff.status === 'added') {
    steps.push({
      type: 'added',
      filePath: toFilePath(gitDiff.newPath),
      codeLanguage: toLanguageIdentifier(gitDiff.newPath),
      code: toCode(gitDiff.hunks)
    })
  } else if (gitDiff.status === 'modified') {
    steps.push({
      type: 'modified',
      filePath: toFilePath(gitDiff.oldPath),
      codeLanguage: toLanguageIdentifier(gitDiff.oldPath),
      code: toCode(gitDiff.hunks)
    })
  } else if (gitDiff.status === 'renamed' && gitDiff.hunks === undefined) {
    steps.push({
      type: 'renamedOnly',
      oldFilePath: toFilePath(gitDiff.oldPath),
      newFilePath: toFilePath(gitDiff.newPath)
    })
  } else if (gitDiff.status === 'renamed' && Array.isArray(gitDiff.hunks)) {
    steps.push({
      type: 'renamedAndModified',
      oldFilePath: toFilePath(gitDiff.oldPath),
      newFilePath: toFilePath(gitDiff.newPath),
      codeLanguage: toLanguageIdentifier(gitDiff.newPath),
      code: toCode(gitDiff.hunks)
    })
  }

  return steps
}

type DiffParseFunction = (rawDiff: IRawDiffItem) => IExerciseStep[] | Error

function parseFluxoDiff({ header, body }: IRawDiffItem): IExerciseStep[] | Error {
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

function toFilePath(gitDiffFilePath: string) {
  return gitDiffFilePath.replace(/^[ab]\//, '')
}

function toCode(hunks: IDiffHunk[]): string {
  return hunks.map(hunk => hunk.lines.join('\n')).join('\n')
}

function toLanguageIdentifier(fileName: string): string {
  return path.extname(fileName).replace(/^\./, '')
}

export function toExerciseSteps(chapterDiff: string): IExerciseStep[] | Error {
  const individualDiffs = chapterDiff.split(/^(diff --.*)/gm).slice(1)

  const steps: IExerciseStep[] = []

  for (let i = 0; i < individualDiffs.length; i = i + 2) {
    const rawDif = {
      header: individualDiffs[i],
      body: individualDiffs[i + 1]
    }

    const diffHeaderTypeMatch = rawDif.header.match(/^diff --(.+?)[\s]/)
    const diffType = diffHeaderTypeMatch && diffHeaderTypeMatch[1]

    if (diffType === null) return new Error('pode não')

    const parseFunctions: { [key: string]: DiffParseFunction | undefined } = {
      git: parseGitDiff,
      fluxo: parseFluxoDiff
    }

    const parseFunction = parseFunctions[diffType]

    if (parseFunction === undefined) {
      return Error(code`
        Invalid diff type: ${diffType}
        Diff Header: 
          ${rawDif.header}
        Diff Body: 
          ${rawDif.body}          
      `)
    }

    const parsedSteps = parseFunction(rawDif)
    if (parsedSteps instanceof Error) return parsedSteps
    steps.push(...parsedSteps)
  }

  return steps
}
