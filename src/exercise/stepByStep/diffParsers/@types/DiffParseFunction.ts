import { IRawDiffItem } from '.'
import { IExerciseStep } from 'exercise/stepByStep/exerciseStep'

export type DiffParseFunction = (rawDiff: IRawDiffItem) => IExerciseStep[] | Error
