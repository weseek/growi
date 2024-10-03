import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { Document } from 'langchain/document';

/**
 * Function to recursively split a markdown string by header sections (and within subsections if they exceed the specified max token count).
 *
 * @param markdownString - The input markdown string
 * @param chunkSize - The chunk size for splitting (default is 1000)
 * @returns An array of split markdown sections
 */
export async function splitMarkdownIntoChunks(
    markdownString: string,
    chunkSize = 1000, // Default chunk size set to 1000
): Promise<Document[]> {
  const validMarkdownString = markdownString || '';

  const mdSplitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
    chunkSize, // Use the provided chunkSize
    chunkOverlap: 0,
  });

  const mdDocs = await mdSplitter.createDocuments([validMarkdownString]);

  return mdDocs;
}
