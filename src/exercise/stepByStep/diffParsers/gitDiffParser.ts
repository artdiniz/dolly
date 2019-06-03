import path from 'path'

import { parse as parseDiff } from 'what-the-diff'
import { html as code } from 'common-tags'

import { IRawDiffItem, IDiffParser } from 'exercise/stepByStep/diffParsers/@types'
import { IExerciseStep } from 'exercise/stepByStep/@types'

function toFilePath(gitDiffFilePath: string) {
  return gitDiffFilePath.replace(/^[ab]\//, '')
}

function toCode(hunks: IDiffHunk[]): string {
  return hunks.map(hunk => hunk.lines.join('\n')).join('\n')
}

function toLanguageIdentifier(fileName: string): string {
  return path.extname(fileName).replace(/^\./, '')
}

function shouldParse(diffType: string) {
  return diffType === 'git'
}

function parseGitDiff({ header, body }: IRawDiffItem): IExerciseStep[] | Error {
  let diffs
  try {
    diffs = parseDiff(header + body)
  } catch (error) {
    return error
  }

  if (diffs.length > 1) {
    return new Error(code`
      Diff parsing failed. Only single diffs are supported but you provided ${
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

export const gitDiffParser: IDiffParser = {
  parse: parseGitDiff,
  shouldParse
}
