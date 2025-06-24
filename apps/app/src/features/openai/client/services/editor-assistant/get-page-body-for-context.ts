import type { UseCodeMirrorEditor } from '@growi/editor/dist/client/services/use-codemirror-editor';

/**
 * Get page body text for AI context processing
 * @param codeMirrorEditor - CodeMirror editor instance
 * @param maxLengthBeforeCursor - Maximum number of characters to include before cursor position
 * @param maxLengthAfterCursor - Maximum number of characters to include after cursor position
 * @returns Page body text optimized for AI context, or undefined if editor is not available
 */
export const getPageBodyForContext = (
    codeMirrorEditor: UseCodeMirrorEditor | undefined,
    maxLengthBeforeCursor: number,
    maxLengthAfterCursor: number,
): string | undefined => {
  const doc = codeMirrorEditor?.getDoc();
  const length = doc?.length ?? 0;

  const maxTotalLength = maxLengthBeforeCursor + maxLengthAfterCursor;

  if (length > maxTotalLength) {
    // Get cursor position
    const cursorPos = codeMirrorEditor?.view?.state.selection.main.head ?? 0;

    // Calculate how many characters are available after cursor
    const availableAfterCursor = length - cursorPos;
    const charsAfterCursor = Math.min(maxLengthAfterCursor, availableAfterCursor);

    // If chars after cursor is less than maxLengthAfterCursor, add the difference to chars before cursor
    const shortfall = maxLengthAfterCursor - charsAfterCursor;
    const charsBeforeCursor = maxLengthBeforeCursor + shortfall;

    // Calculate start position (cursor - charsBeforeCursor, but not less than 0)
    const startPos = Math.max(0, cursorPos - charsBeforeCursor);

    // Calculate end position
    const endPos = cursorPos + charsAfterCursor;

    return doc?.slice(startPos, endPos).toString();
  }

  return codeMirrorEditor?.getDocString();
};
