import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { TiktokenModel } from 'js-tiktoken';
import { encodingForModel } from 'js-tiktoken'; // eslint-disable-line camelcase

import type { Chunk } from './markdown-splitter';
import { splitMarkdownIntoChunks } from './markdown-splitter';

/**
 * Splits Markdown text based on the number of tokens.
 * Uses the `splitMarkdownIntoChunks` function to get initial chunks,
 * then adjusts each chunk to ensure it's under `maxTokens`.
 *
 * Labels are assigned in the order: frontmatter, 0, 1, 2, ...
 *
 * @param markdownText - Input Markdown text.
 * @param model - Tiktoken model to use.
 * @param maxTokens - Maximum number of tokens per chunk.
 * @returns An array of labeled chunks.
 */
export async function splitMarkdownByTokens(
    markdownText: string,
    model: TiktokenModel,
    maxTokens: number,
): Promise<Chunk[]> {
  const initialChunks = await splitMarkdownIntoChunks(markdownText);
  const encoder = encodingForModel(model);

  // Process each chunk asynchronously
  const chunkProcessingPromises = initialChunks.map(async(chunk) => {
    const tokenCount = encoder.encode(chunk.text).length;

    if (tokenCount > maxTokens) {
      // Calculate the number of splits by adding 10% to the token count
      const numSplits = Math.ceil((tokenCount * 1.1) / maxTokens);

      // Calculate the average number of characters per chunk
      const averageCharsPerChunk = Math.ceil(chunk.text.length / numSplits);

      // Set the overlap amount to 5% of the average character count
      const overlap = Math.ceil(averageCharsPerChunk * 0.05);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: averageCharsPerChunk,
        chunkOverlap: overlap,
      });

      // Re-split using LangChain (await is necessary)
      const splitTexts = await splitter.splitText(chunk.text);

      return splitTexts.map((subText, index) => ({
        label: `${chunk.label}-${index + 1}`, // Add split number to the label
        type: chunk.type,
        text: subText,
        tokenCount: encoder.encode(subText).length,
      }));
    }

    // If token count is less than or equal to maxTokens, return as is
    return [
      {
        label: chunk.label,
        type: chunk.type,
        text: chunk.text,
        tokenCount,
      },
    ];
  });

  const finalChunks = (await Promise.all(chunkProcessingPromises)).flat();

  return finalChunks;
}
