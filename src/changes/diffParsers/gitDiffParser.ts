import path from 'path'

import { parse as parseDiff } from 'what-the-diff'
import { html as code } from 'common-tags'

import { IRawDiffItem, IDiffParser } from 'changes/diffParsers/@types'
import { IChange, ICodeLine } from 'changes/@types'

function toFilePath(gitDiffFilePath: string) {
  return gitDiffFilePath.replace(/^[ab]\//, '')
}

function toCodeLineType(typeSymbol: string): ICodeLine['type'] | Error {
  if (typeSymbol === '+') return 'added'
  if (typeSymbol === '-') return 'deleted'
  if (typeSymbol === ' ') return 'context'
  else return Error('Unknown code line starting with symbol: ' + typeSymbol)
}

function toCode(hunks: IDiffHunk[]): ICodeLine[] | Error {
  const lines: ICodeLine[] = []

  for (let hunk of hunks) {
    for (let line of hunk.lines) {
      const lineMatch = line.match(/^([\+\-\\ ]{1})([\s\S]*)$/)
      if (lineMatch === null) {
        return Error(code`
          Unknown code line type in diff line:

            \`${line}\`
        `)
      }
      const [typeSymbol, content] = [lineMatch[1], lineMatch[2]]
      if (typeSymbol.match(/\\/)) continue

      const type = toCodeLineType(typeSymbol)
      if (type instanceof Error) return type

      lines.push({ type, content })
    }
  }

  return lines
}

function toLanguageIdentifier(fileName: string): string {
  return path.extname(fileName).replace(/^\./, '')
}

function shouldParse(diffType: string) {
  return diffType === 'git'
}

function parseGitDiff({ header, body }: IRawDiffItem): IChange[] | Error {
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

  const changes: IChange[] = []

  const changeCode = gitDiff.hunks && toCode(gitDiff.hunks)
  if (changeCode instanceof Error) return changeCode

  if (gitDiff.status === 'deleted') {
    changes.push({
      type: 'deleted',
      filePath: toFilePath(gitDiff.oldPath),
      codeLanguage: toLanguageIdentifier(gitDiff.oldPath),
      code: changeCode
    })
  } else if (gitDiff.status === 'added') {
    changes.push({
      type: 'added',
      filePath: toFilePath(gitDiff.newPath),
      codeLanguage: toLanguageIdentifier(gitDiff.newPath),
      code: changeCode
    })
  } else if (gitDiff.status === 'modified') {
    changes.push({
      type: 'modified',
      filePath: toFilePath(gitDiff.oldPath),
      codeLanguage: toLanguageIdentifier(gitDiff.oldPath),
      code: changeCode
    })
  } else if (
    (gitDiff.status === 'renamed' && gitDiff.hunks === undefined) ||
    (gitDiff.status === 'renamed' &&
      Array.isArray(gitDiff.hunks) &&
      gitDiff.hunks.length === 0)
  ) {
    changes.push({
      type: 'renamedOnly',
      oldFilePath: toFilePath(gitDiff.oldPath),
      newFilePath: toFilePath(gitDiff.newPath)
    })
  } else if (
    gitDiff.status === 'renamed' &&
    Array.isArray(gitDiff.hunks) &&
    gitDiff.hunks.length > 0
  ) {
    changes.push({
      type: 'renamedAndModified',
      oldFilePath: toFilePath(gitDiff.oldPath),
      newFilePath: toFilePath(gitDiff.newPath),
      codeLanguage: toLanguageIdentifier(gitDiff.newPath),
      code: changeCode
    })
  }

  return changes
}

export const gitDiffParser: IDiffParser = {
  parse: parseGitDiff,
  shouldParse
}
