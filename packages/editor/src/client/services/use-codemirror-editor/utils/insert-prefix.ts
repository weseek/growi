import { useCallback } from 'react';

import type { ChangeSpec } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

export type InsertPrefix = (prefix: string, noSpaceIfPrefixExists?: boolean) => void;

export const useInsertPrefix = (view?: EditorView): InsertPrefix => {
  return useCallback((prefix: string, noSpaceIfPrefixExists = false) => {
    if (view == null) {
      return;
    }

    const { from, to } = view.state.selection.main;
    const startLine = view.state.doc.lineAt(from);
    const endLine = view.state.doc.lineAt(to);

    let allLinesHavePrefix = true;
    for (let i = startLine.number; i <= endLine.number; i++) {
      const line = view.state.doc.line(i);
      const trimmedLine = line.text.trim();
      if (trimmedLine !== '' && !trimmedLine.startsWith(prefix)) {
        allLinesHavePrefix = false;
        break;
      }
    }

    const changes: ChangeSpec[] = [];
    let totalLengthChange = 0;

    for (let i = startLine.number; i <= endLine.number; i++) {
      const line = view.state.doc.line(i);
      const trimmedLine = line.text.trim();

      if (trimmedLine === '') {
        continue;
      }

      const leadingSpaces = line.text.match(/^\s*/)?.[0] || '';
      const contentTrimmed = line.text.trimStart();

      if (allLinesHavePrefix) {
        const contentStartMatch = line.text.match(new RegExp(`^\\s*${prefix}\\s+`));
        if (contentStartMatch) {
          const prefixWithSpaces = contentStartMatch[0];
          const indentLevel = Math.floor(leadingSpaces.length / 2) * 2; // Preserve indent level
          const newIndent = ' '.repeat(indentLevel);

          changes.push({
            from: line.from,
            to: line.from + prefixWithSpaces.length,
            insert: newIndent,
          });

          totalLengthChange -= (prefixWithSpaces.length - newIndent.length);
        }
      }
      else {
        const insertText = `${leadingSpaces}${prefix} ${contentTrimmed}`;
        changes.push({
          from: line.from,
          to: line.to,
          insert: insertText,
        });
        totalLengthChange += (insertText.length - line.text.length);
      }
    }

    view.dispatch({ changes });

    view.dispatch({
      selection: {
        anchor: endLine.to + totalLengthChange,
      },
    });
    view.focus();
  }, [view]);
};
