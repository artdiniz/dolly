declare module 'what-the-diff' {
  const parse: (diff: string) => IDiff[]
}

interface IDiffRenamedExtendedHeaders {
  oldPath: string
  newPath: string
  oldMode: string
  newMode: string
  similarity: number
  status: 'renamed'
  hunks: IDiffHunk[] | undefined
}

interface IDiffModifiedExtendedHeaders {
  oldPath: string
  newPath: string
  oldMode: string
  newMode: string
  status: 'modified'
  hunks: IDiffHunk[]
}

interface IDiffDeletedExtendedHeaders {
  oldPath: string
  newPath: null
  oldMode: string
  newMode: null
  status: 'deleted'
  hunks: IDiffHunk[]
}

interface IDiffAddedExtendedHeaders {
  oldPath: null
  newPath: string
  oldMode: null
  newMode: string
  status: 'added'
  hunks: IDiffHunk[]
}

interface IDiffHunk {
  oldStartLine: number
  oldLineCount: number
  newStartLine: number
  newLineCount: number
  heading: ''
  lines: string[]
  similarity: number
}

interface ITextFileDiff {
  binary: false
}

interface IBinaryFileDiff {
  binary: true
}

type IDiff = (
  | IDiffRenamedExtendedHeaders
  | IDiffModifiedExtendedHeaders
  | IDiffDeletedExtendedHeaders
  | IDiffAddedExtendedHeaders) &
  (ITextFileDiff | IBinaryFileDiff)
