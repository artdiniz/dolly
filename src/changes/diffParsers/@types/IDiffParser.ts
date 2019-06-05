import { IChange } from 'changes/@types'
import { IRawDiffItem } from 'changes/diffParsers/@types'

export interface IDiffParser {
  shouldParse(diffType: string): boolean
  parse(rawDiff: IRawDiffItem): IChange[] | Error
}
