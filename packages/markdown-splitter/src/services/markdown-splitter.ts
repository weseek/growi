import remarkParse from 'remark-parse';
import type { Options as StringifyOptions } from 'remark-stringify';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

export type Chunk = {
  label: string;
  text: string;
};

/**
 * Processes and adds a new chunk to the chunks array if content is not empty.
 * Clears the contentBuffer array after processing.
 * @param chunks - The array to store processed chunks.
 * @param contentBuffer - The array of content lines to be processed.
 * @param label - The label for the content chunk.
 */
function addContentChunk(chunks: Chunk[], contentBuffer: string[], label: string) {
  const contentText = contentBuffer.join('\n\n').trimEnd();
  if (contentText !== '') {
    chunks.push({ label, text: contentText });
  }
  contentBuffer.length = 0; // Clear the contentBuffer array
}

/**
 * Updates the section numbers based on the heading depth and returns the updated section label.
 * Handles non-consecutive heading levels by initializing missing levels with 1.
 * @param sectionNumbers - The current section numbers.
 * @param headingDepth - The depth of the heading (e.g., # is depth 1).
 * @returns The updated section label.
 */
function updateSectionNumbers(sectionNumbers: number[], headingDepth: number): string {
  if (headingDepth > sectionNumbers.length) {
    // Initialize missing levels with 1
    while (sectionNumbers.length < headingDepth) {
      sectionNumbers.push(1);
    }
  }
  else if (headingDepth === sectionNumbers.length) {
    // Increment the last number for the same level
    sectionNumbers[headingDepth - 1]++;
  }
  else {
    // Remove deeper levels and increment the current level
    sectionNumbers.splice(headingDepth);
    sectionNumbers[headingDepth - 1]++;
  }
  return sectionNumbers.join('-');
}

/**
 * Splits Markdown text into labeled chunks using remark-parse and remark-stringify,
 * considering content that may start before any headers and handling non-consecutive heading levels.
 * @param markdownText - The input Markdown string.
 * @returns An array of labeled chunks.
 */
export async function splitMarkdownIntoChunks(markdownText: string): Promise<Chunk[]> {
  const chunks: Chunk[] = [];
  const sectionNumbers: number[] = [];

  if (typeof markdownText !== 'string' || markdownText.trim() === '') {
    return chunks;
  }

  const parser = unified().use(remarkParse);

  const stringifyOptions: StringifyOptions = {
    bullet: '-', // Set list bullet to hyphen
    rule: '-', // Use hyphen for horizontal rules
  };

  // Create stringifier once
  const stringifier = unified().use(remarkStringify, stringifyOptions);

  const parsedTree = parser.parse(markdownText);

  const contentBuffer: string[] = [];
  let currentSectionLabel = '';

  const markdownNodes = parsedTree.children;

  for (const node of markdownNodes) {
    if (node.type === 'heading') {
      // Process pending content before heading
      if (contentBuffer.length > 0) {
        const contentLabel = currentSectionLabel !== '' ? `${currentSectionLabel}-content` : '0-content';
        addContentChunk(chunks, contentBuffer, contentLabel);
      }

      const headingDepth = node.depth as number;
      currentSectionLabel = updateSectionNumbers(sectionNumbers, headingDepth);

      const headingMarkdown = stringifier.stringify(node as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      chunks.push({ label: `${currentSectionLabel}-heading`, text: headingMarkdown.trim() });
    }
    else {
      const contentMarkdown = stringifier.stringify(node as any);// eslint-disable-line @typescript-eslint/no-explicit-any
      contentBuffer.push(contentMarkdown.trim());
    }
  }

  // Process any remaining content
  if (contentBuffer.length > 0) {
    const contentLabel = currentSectionLabel !== '' ? `${currentSectionLabel}-content` : '0-content';
    addContentChunk(chunks, contentBuffer, contentLabel);
  }

  return chunks;
}
