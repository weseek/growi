
import { type Text as YText } from 'yjs';

import { ClientFuzzyMatcher } from './fuzzy-matching';
import { normalizeForBrowserFuzzyMatch } from './text-normalization';

/**
 * Perform search and replace operation on YText with fuzzy matching
 */
export function performSearchReplace(
    yText: YText,
    searchText: string,
    replaceText: string,
    startLine: number,
): boolean {
  const content = yText.toString();
  const lines = content.split('\n');

  // 1. 指定行から検索開始
  const fuzzyMatcher = new ClientFuzzyMatcher(0.8);
  const result = fuzzyMatcher.findBestMatch(
    content,
    searchText,
    {
      preferredStartLine: startLine,
      bufferLines: 20, // 前後20行の範囲で検索
    },
  );

  if (result.success && result.matchedRange) {
    // 2. 見つかった箇所を正確に置換
    const { startIndex, endIndex } = result.matchedRange;
    yText.delete(startIndex, endIndex - startIndex);
    yText.insert(startIndex, replaceText);
    return true;
  }

  return false; // 検索失敗
}

/**
 * Exact search without fuzzy matching for testing purposes
 */
export function performExactSearchReplace(
    yText: YText,
    searchText: string,
    replaceText: string,
    startLine?: number,
): boolean {
  const content = yText.toString();
  const lines = content.split('\n');

  // If startLine is specified, search from that line
  let searchStartIndex = 0;
  if (startLine != null && startLine > 0 && startLine <= lines.length) {
    // Calculate starting position for the specified line (1-based)
    for (let i = 0; i < startLine - 1; i++) {
      searchStartIndex += lines[i].length + 1; // +1 for newline
    }
  }

  // Find the search text
  const searchIndex = content.indexOf(searchText, searchStartIndex);

  if (searchIndex !== -1) {
    // Replace the found text
    yText.delete(searchIndex, searchText.length);
    yText.insert(searchIndex, replaceText);
    return true;
  }

  return false;
}

/**
 * Helper function to get line information from content
 */
export function getLineFromIndex(content: string, index: number): { lineNumber: number, columnNumber: number } {
  const lines = content.substring(0, index).split('\n');
  const lineNumber = lines.length;
  const columnNumber = lines[lines.length - 1].length;

  return { lineNumber, columnNumber };
}

/**
 * Helper function to get content around a specific line for debugging
 */
export function getContextAroundLine(content: string, lineNumber: number, contextLines = 3): string {
  const lines = content.split('\n');
  const startLine = Math.max(0, lineNumber - contextLines - 1);
  const endLine = Math.min(lines.length, lineNumber + contextLines);

  return lines.slice(startLine, endLine)
    .map((line, index) => {
      const actualLineNumber = startLine + index + 1;
      const marker = actualLineNumber === lineNumber ? '→' : ' ';
      return `${marker} ${actualLineNumber.toString().padStart(3)}: ${line}`;
    })
    .join('\n');
}
