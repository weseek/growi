import yaml from 'js-yaml';
import remarkFrontmatter from 'remark-frontmatter'; // Frontmatter processing
import remarkGfm from 'remark-gfm'; // GFM processing
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
  let frontmatter: Record<string, unknown> | null = null; // Variable to store frontmatter
  const contentBuffer: string[] = [];
  let currentSectionLabel = '';

  if (typeof markdownText !== 'string' || markdownText.trim() === '') {
    return chunks;
  }

  const parser = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm); // Enable GFM extensions

  const stringifyOptions: StringifyOptions = {
    bullet: '-', // Set list bullet to hyphen
    rule: '-', // Use hyphen for horizontal rules
  };

  const stringifier = unified()
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)
    .use(remarkStringify, stringifyOptions);

  const parsedTree = parser.parse(markdownText);

  // Iterate over top-level nodes to prevent duplication
  for (const node of parsedTree.children) {
    if (node.type === 'yaml') {
      frontmatter = yaml.load(node.value) as Record<string, unknown>;
    }
    else if (node.type === 'heading') {
      // Process pending content before heading
      if (contentBuffer.length > 0) {
        const contentLabel = currentSectionLabel !== '' ? `${currentSectionLabel}-content` : '0-content';
        addContentChunk(chunks, contentBuffer, contentLabel);
      }

      const headingDepth = node.depth;
      currentSectionLabel = updateSectionNumbers(sectionNumbers, headingDepth);

      const headingMarkdown = stringifier.stringify(node as any);// eslint-disable-line @typescript-eslint/no-explicit-any
      chunks.push({ label: `${currentSectionLabel}-heading`, text: headingMarkdown.trim() });
    }
    else {
      // Add non-heading content to the buffer
      const contentMarkdown = stringifier.stringify(node as any).trim(); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (contentMarkdown !== '') {
        contentBuffer.push(contentMarkdown);
      }
    }
  }

  // Process any remaining content
  if (contentBuffer.length > 0) {
    const contentLabel = currentSectionLabel !== '' ? `${currentSectionLabel}-content` : '0-content';
    addContentChunk(chunks, contentBuffer, contentLabel);
  }

  if (frontmatter) {
    chunks.unshift({
      label: 'frontmatter',
      text: JSON.stringify(frontmatter, null, 2),
    });
  }

  return chunks;
}
