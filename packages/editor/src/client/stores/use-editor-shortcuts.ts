import { useEffect, useCallback } from 'react';

import type { SelectionRange, StateCommand } from '@codemirror/state';
import { EditorSelection } from '@codemirror/state';
import { keymap } from '@codemirror/view';

import type { UseCodeMirrorEditor } from '../services';

import type { EditorView } from 'src/interfaces';

const addSymbol = (text: string, symbol: string, shouldWrap: boolean): string => {
  return shouldWrap ? `${symbol}${text}${symbol}` : `${symbol}${text}`;
};

const removeSymbol = (text: string, symbol: string): string => {
  const replaceRegex = new RegExp(`^${symbol}|${symbol}$`, 'g');
  return text.replace(replaceRegex, '');
};

const processLine = (line: string, symbol: string, shouldWrap: boolean, safeSymbol: string): string => {
  const fullWrapRegex = new RegExp(`^${safeSymbol}.*${safeSymbol}$`);
  const partialWrapRegex = new RegExp(`^${safeSymbol}|${safeSymbol}$`);

  if (shouldWrap ? fullWrapRegex.test(line) : partialWrapRegex.test(line)) {
    return removeSymbol(line, safeSymbol);
  }
  return addSymbol(line, symbol, shouldWrap);
};

const generateAddMarkdownSymbolCommand = (symbol: string, shouldWrap = false): StateCommand => {
  const addMarkdownSymbolCommand: StateCommand = ({ state, dispatch }) => {
    const escapeSymbol = (symbol: string): string => {
      const specialCharactersRegex = /[.*+?^${}()|[\]\\]/g;
      return symbol.replace(specialCharactersRegex, '\\$&');
    };

    const safeSymbol = escapeSymbol(symbol);

    if (state.selection.ranges.length === 0) return false;

    dispatch(state.update({
      changes: state.selection.ranges.map((range) => {
        const selectedText = state.sliceDoc(range.from, range.to);

        const changedText = selectedText
          .split('\n')
          .map(line => processLine(line, symbol, shouldWrap, safeSymbol))
          .join('\n');

        return {
          from: range.from,
          to: range.to,
          insert: changedText,
        };
      }),
    }));

    return true;
  };

  return addMarkdownSymbolCommand;
};

export const useEditorShortcuts = (
    codeMirrorEditor?: UseCodeMirrorEditor,
): void => {

  useEffect(() => {

    const extension = keymap.of([
      { key: 'mod-i', run: generateAddMarkdownSymbolCommand('*', true) },
      { key: 'mod-b', run: generateAddMarkdownSymbolCommand('**', true) },
      { key: 'mod-shift-x', run: generateAddMarkdownSymbolCommand('~~', true) },
      { key: 'mod-shift-c', run: generateAddMarkdownSymbolCommand('`', true) },
      { key: 'mod-shift-7', run: generateAddMarkdownSymbolCommand('1. ') },
      { key: 'mod-shift-8', run: generateAddMarkdownSymbolCommand('- ') },
      { key: 'mod-shift-9', run: generateAddMarkdownSymbolCommand('> ') },
    ]);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);
    return cleanupFunction;

  }, [codeMirrorEditor]);

  const addMultiCursor = useCallback((view: EditorView, direction: 'up' | 'down') => {

    const selection = view.state.selection;
    const doc = view.state.doc;
    const ranges = selection.ranges;
    const newRanges: SelectionRange[] = [];

    ranges.forEach((range) => {

      const head = range.head;
      const line = doc.lineAt(head);
      const targetLine = direction === 'up' ? line.number - 1 : line.number + 1;

      if (targetLine < 1 || targetLine > doc.lines) return;

      const targetLineText = doc.line(targetLine);

      const col = Math.min(range.head - line.from, targetLineText.length);
      const cursorPos = targetLineText.from + col;

      newRanges.push(EditorSelection.cursor(cursorPos));

    });

    if (newRanges.length) {
      const transaction = {
        selection: EditorSelection.create([...ranges, ...newRanges]),
      };

      view.dispatch(transaction);
    }

    return true;
  }, []);

  useEffect(() => {

    const extension = keymap.of([
      { key: 'mod-alt-ArrowUp', run: view => addMultiCursor(view, 'up') },
      { key: 'mod-alt-ArrowDown', run: view => addMultiCursor(view, 'down') },
    ]);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);
    return cleanupFunction;

  }, [addMultiCursor, codeMirrorEditor]);

};
