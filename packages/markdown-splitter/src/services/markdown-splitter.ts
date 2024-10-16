import yaml from 'js-yaml';
import remarkFrontmatter from 'remark-frontmatter'; // Frontmatter processing
import remarkGfm from 'remark-gfm'; // GFM processing
import remarkParse from 'remark-parse';
import type { Options as StringifyOptions } from 'remark-stringify';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

export type Chunk = {
  label: string;
  type: string;
  text: string;
  tokenCount?: number;
};

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
 * processing each content node separately and labeling them as 1-content-1, 1-content-2, etc.
 * @param markdownText - The input Markdown string.
 * @returns An array of labeled chunks.
 */
export async function splitMarkdownIntoChunks(markdownText: string): Promise<Chunk[]> {
  const chunks: Chunk[] = [];
  const sectionNumbers: number[] = [];
  let frontmatter: Record<string, unknown> | null = null; // Variable to store frontmatter
  let currentSectionLabel = '';
  const contentCounters: Record<string, number> = {};

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
      const headingDepth = node.depth;
      currentSectionLabel = updateSectionNumbers(sectionNumbers, headingDepth);

      const headingMarkdown = stringifier.stringify(node as any).trim(); // eslint-disable-line @typescript-eslint/no-explicit-any
      chunks.push({ label: `${currentSectionLabel}-heading`, type: node.type, text: headingMarkdown });
    }
    else {
      // Process non-heading content individually
      const contentMarkdown = stringifier.stringify(node as any).trim(); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (contentMarkdown !== '') {
        const contentCountKey = currentSectionLabel || '0';
        if (!contentCounters[contentCountKey]) {
          contentCounters[contentCountKey] = 1;
        }
        else {
          contentCounters[contentCountKey]++;
        }
        const contentLabel = currentSectionLabel !== ''
          ? `${currentSectionLabel}-content-${contentCounters[contentCountKey]}`
          : `0-content-${contentCounters[contentCountKey]}`;
        chunks.push({ label: contentLabel, type: node.type, text: contentMarkdown });
      }
    }
  }

  if (frontmatter) {
    chunks.unshift({
      label: 'frontmatter',
      type: 'yaml',
      text: JSON.stringify(frontmatter, null, 2),
    });
  }

  return chunks;
}
