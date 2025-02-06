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

    let allLinesEmpty = true;
    for (let i = startLine.number; i <= endLine.number; i++) {
      const line = view.state.doc.line(i);
      if (line.text.trim() !== '') {
        allLinesEmpty = false;
        break;
      }
    }

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
      const leadingSpaces = line.text.match(/^\s*/)?.[0] || '';
      const contentTrimmed = line.text.trimStart();

      if (allLinesEmpty) {
        // Add prefix to all empty lines
        const insertText = `${leadingSpaces}${prefix} `;
        changes.push({
          from: line.from,
          to: line.to,
          insert: insertText,
        });
        totalLengthChange += (insertText.length - line.text.length);
        continue;
      }

      if (trimmedLine === '') {
        continue;
      }

      if (allLinesHavePrefix) {
        const contentStartMatch = line.text.match(new RegExp(`^\\s*(${prefix}+)\\s*`));
        if (contentStartMatch) {
          if (noSpaceIfPrefixExists) {
            const existingPrefixes = contentStartMatch[1];
            const indentLevel = Math.floor(leadingSpaces.length / 2) * 2;
            const newIndent = ' '.repeat(indentLevel);
            const newPrefix = `${newIndent}${existingPrefixes}${prefix} `;

            const restOfLine = line.text.slice(contentStartMatch[0].length);
            const newLine = `${newPrefix}${restOfLine}`;

            changes.push({
              from: line.from,
              to: line.to,
              insert: newLine,
            });

            totalLengthChange += (newLine.length - line.text.length);
          }
          else {
            const prefixWithSpaces = contentStartMatch[0];
            const indentLevel = Math.floor(leadingSpaces.length / 2) * 2;
            const newIndent = ' '.repeat(indentLevel);

            changes.push({
              from: line.from,
              to: line.from + prefixWithSpaces.length,
              insert: newIndent,
            });

            totalLengthChange -= (prefixWithSpaces.length - newIndent.length);
          }
        }
      }
      else {
        const insertText = noSpaceIfPrefixExists && line.text.startsWith(prefix)
          ? `${leadingSpaces}${prefix}${contentTrimmed}`
          : `${leadingSpaces}${prefix} ${contentTrimmed}`;

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
