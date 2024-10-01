import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

/**
 * Function to recursively split a markdown string by header sections (and within subsections if they exceed the specified max token count).
 *
 * @param markdownString - The input markdown string
 * @param chunkSize - The chunk size for splitting (default is 1000)
 * @returns An array of split markdown sections
 */
export async function splitMarkdownByTokens(
    markdownString: string,
    chunkSize = 1000, // Default chunk size set to 1000
): Promise<Document[]> {
  const validMarkdownString = markdownString || '';

  const mdSplitter = new RecursiveCharacterTextSplitter({
    chunkSize, // Use the provided chunkSize
    chunkOverlap: 0,
  });

  const mdDocs = await mdSplitter.createDocuments([validMarkdownString]);

  return mdDocs;
}
