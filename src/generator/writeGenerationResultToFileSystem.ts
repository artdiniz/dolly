import path from 'path'
import { writeFile } from 'utils/fs'

import { IChapterGenerationResult } from 'generator/generateChapter'
import { IChapterFilesWriteResult } from 'generator/@types'

export async function writeGenerationResultToFileSystem(
  generationResult: IChapterGenerationResult,
  directories: {
    output: string
    meta: string
  }
): Promise<IChapterFilesWriteResult> {
  const chapterFile = generationResult.chapterId + '.md'
  const markdownFilePath = path.join(directories.output, chapterFile)
  const metaFilePath = path.join(directories.meta, chapterFile)

  if (!generationResult.success) {
    await writeFile(markdownFilePath, generationResult.error.toString())
    return {
      success: generationResult.success,
      chapterId: generationResult.chapterId,
      error: generationResult.error,
      markdownFilePath,
      metaFilePath
    }
  }

  const { success, chapterId, chapterContent, metaContent } = generationResult

  const writeMarkdownPromise = writeFile(markdownFilePath, chapterContent)
  const writeMetaPromise = writeFile(metaFilePath, metaContent)
  await Promise.all([writeMarkdownPromise, writeMetaPromise])

  return { success, chapterId, markdownFilePath, metaFilePath }
}
