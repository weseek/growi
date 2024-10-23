import type { TiktokenModel } from 'js-tiktoken';
import { encodingForModel } from 'js-tiktoken';
import yaml from 'js-yaml';
import type { Options as StringifyOptions } from 'remark-stringify';

export type MarkdownFragment = {
  label: string;
  type: string;
  text: string;
  tokenCount: number;
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
 * Splits Markdown text into labeled markdownFragments using remark-parse and remark-stringify,
 * processing each content node separately and labeling them as 1-content-1, 1-content-2, etc.
 * @param markdownText - The input Markdown string.
 * @returns An array of labeled markdownFragments.
 */
export async function splitMarkdownIntoFragments(markdownText: string, model: TiktokenModel): Promise<MarkdownFragment[]> {
  const markdownFragments: MarkdownFragment[] = [];
  const sectionNumbers: number[] = [];
  let currentSectionLabel = '';
  const contentCounters: Record<string, number> = {};

  if (typeof markdownText !== 'string' || markdownText.trim() === '') {
    return markdownFragments;
  }

  const encoder = encodingForModel(model);

  const remarkParse = (await import('remark-parse')).default;
  const remarkFrontmatter = (await import('remark-frontmatter')).default;
  const remarkGfm = (await import('remark-gfm')).default;
  const remarkStringify = (await import('remark-stringify')).default;
  const unified = (await import('unified')).unified;

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
      // Frontmatter block found, handle only the first instance
      const frontmatter = yaml.load(node.value) as Record<string, unknown>;
      const frontmatterText = JSON.stringify(frontmatter, null, 2);
      const tokenCount = encoder.encode(frontmatterText).length;
      markdownFragments.push({
        label: 'frontmatter',
        type: 'yaml',
        text: frontmatterText,
        tokenCount,
      });
    }
    else if (node.type === 'heading') {
      const headingDepth = node.depth;
      currentSectionLabel = updateSectionNumbers(sectionNumbers, headingDepth);

      const headingMarkdown = stringifier.stringify(node as any).trim(); // eslint-disable-line @typescript-eslint/no-explicit-any
      const tokenCount = encoder.encode(headingMarkdown).length;
      markdownFragments.push({
        label: `${currentSectionLabel}-heading`, type: node.type, text: headingMarkdown, tokenCount,
      });
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
        const tokenCount = encoder.encode(contentMarkdown).length;
        markdownFragments.push({
          label: contentLabel, type: node.type, text: contentMarkdown, tokenCount,
        });
      }
    }
  }

  return markdownFragments;
}
