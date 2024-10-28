import { TiktokenModel } from 'js-tiktoken';

export type MarkdownFragment = {
    label: string;
    type: string;
    text: string;
    tokenCount: number;
};
/**
 * Splits Markdown text into labeled markdownFragments using remark-parse and remark-stringify,
 * processing each content node separately and labeling them as 1-content-1, 1-content-2, etc.
 * @param markdownText - The input Markdown string.
 * @returns An array of labeled markdownFragments.
 */
export declare function splitMarkdownIntoFragments(markdownText: string, model: TiktokenModel): Promise<MarkdownFragment[]>;
