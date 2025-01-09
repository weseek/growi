import { useEffect } from 'react';

import type { SelectionRange, Extension } from '@codemirror/state';
import { EditorSelection, type ChangeSpec } from '@codemirror/state';
import { keymap, type Command, EditorView } from '@codemirror/view';

import type { UseCodeMirrorEditor } from '../services';

const addPrefixSymbol = (text: string, symbol: string): string => {
  return `${symbol}${text}`;
};

const addSuffixSymbol = (text: string, symbol: string): string => {
  return `${text}${symbol}`;
};

const wrapTextWithSymbol = (text: string, symbol: string): string => {
  return `${symbol}${text}${symbol}`;
};

const removeSymbol = (text: string, symbol: string): string => {
  const replaceRegex = new RegExp(`${symbol}`, 'g');
  return text.replace(replaceRegex, '');
};

const escapeSymbol = (symbol: string): string => {
  const specialCharactersRegex = /[.*+?^${}()|[\]\\]/g;
  return symbol.replace(specialCharactersRegex, '\\$&');
};

const processLine = (
    lineText: string, symbol: string, addSymbol: (text: string, symbol: string) => string,
): string => {

  const safeSymbol = escapeSymbol(symbol);

  const isMarkdownRegex = new RegExp(`${safeSymbol}`, 'g');
  const isMarkdown = isMarkdownRegex.test(lineText);

  if (isMarkdown) {
    return removeSymbol(lineText, safeSymbol);
  }
  return addSymbol(lineText, symbol);
};

const generateAddMarkdownSymbolCommand = (symbol: string, addSymbol: (text: string, symbol: string) => string): Command => {
  const addMarkdownSymbolCommand: Command = (view: EditorView) => {
    const state = view.state;
    const dispatch = view.dispatch;

    if (state.selection.ranges.length === 0) return false;

    dispatch(state.update({
      changes: state.selection.ranges.map((range) => {
        const selectedText = state.sliceDoc(range.from, range.to);

        const changedText = selectedText
          .split('\n')
          .map(line => processLine(line, symbol, addSymbol))
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

const makeTextHyperLink: Command = (view: EditorView) => {
  const addPrefixCommand = generateAddMarkdownSymbolCommand('[', addPrefixSymbol);
  addPrefixCommand(view);
  const addSuffixCommand = generateAddMarkdownSymbolCommand(']()', addSuffixSymbol);
  addSuffixCommand(view);
  return true;
};

const makeTextCodeBlock: Command = (view: EditorView) => {
  const state = view.state;
  const dispatch = view.dispatch;

  const selections = state.selection.ranges;
  const doc = state.doc;
  const changes: ChangeSpec[] = [];
  const newSelectionRanges: SelectionRange[] = [];

  selections.forEach((range) => {
    const startLine = doc.lineAt(range.from);
    const endLine = doc.lineAt(range.to);

    const isAlreadyWrapped = startLine.text.trimStart().startsWith('```')
      && endLine.text.trimEnd().endsWith('```');

    if (isAlreadyWrapped) {
      changes.push({
        from: startLine.from,
        to: startLine.from + 4,
        insert: '',
      });

      changes.push({
        from: endLine.to - 4,
        to: endLine.to,
        insert: '',
      });

      newSelectionRanges.push(EditorSelection.range(startLine.from, endLine.to - 8));
    }
    else {
      changes.push({
        from: startLine.from,
        insert: '```\n',
      });

      changes.push({
        from: endLine.to,
        insert: '\n```',
      });

      newSelectionRanges.push(EditorSelection.range(startLine.from, endLine.to + 8));
    }
  });

  dispatch(state.update({
    changes,
    selection: EditorSelection.create(newSelectionRanges),
  }));

  return true;
};

const addMultiCursor = (view: EditorView, direction: 'up' | 'down') => {

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
};

const makeCodeBlockExtension: Extension = EditorView.domEventHandlers({
  keydown: (event, view) => {

    const isModKey = event.ctrlKey || event.metaKey;

    if (event.key.toLowerCase() === 'c' && event.shiftKey && event.altKey && isModKey) {
      event.preventDefault();
      makeTextCodeBlock(view);
      return true;
    }

    return false;
  },
});

const altClickExtension = EditorView.domEventHandlers({
  mousedown: (event, view) => {
    if (event.altKey) {
      event.preventDefault();

      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (pos === null) return;

      const newSelection = EditorSelection.create([
        ...view.state.selection.ranges,
        EditorSelection.cursor(pos),
      ]);
      view.dispatch(view.state.update({ selection: newSelection }));
    }
  },
});

export const useEditorShortcuts = (codeMirrorEditor?: UseCodeMirrorEditor): void => {
  useEffect(() => {
    const cleanupFunction = codeMirrorEditor?.appendExtensions?.([altClickExtension]);
    return cleanupFunction;
  }, [codeMirrorEditor]);

  useEffect(() => {
    const cleanupFunction = codeMirrorEditor?.appendExtensions?.([makeCodeBlockExtension]);
    return cleanupFunction;
  }, [codeMirrorEditor]);

  useEffect(() => {

    const extension = keymap.of([
      { key: 'mod-i', run: generateAddMarkdownSymbolCommand('*', wrapTextWithSymbol) },
      { key: 'mod-b', run: generateAddMarkdownSymbolCommand('**', wrapTextWithSymbol) },
      { key: 'mod-shift-x', run: generateAddMarkdownSymbolCommand('~~', wrapTextWithSymbol) },
      { key: 'mod-shift-c', run: generateAddMarkdownSymbolCommand('`', wrapTextWithSymbol) },
      { key: 'mod-shift-7', run: generateAddMarkdownSymbolCommand('1. ', addPrefixSymbol) },
      { key: 'mod-shift-8', run: generateAddMarkdownSymbolCommand('- ', addPrefixSymbol) },
      { key: 'mod-shift-9', run: generateAddMarkdownSymbolCommand('> ', addPrefixSymbol) },
      { key: 'mod-shift-u', run: makeTextHyperLink },
    ]);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);
    return cleanupFunction;

  }, [codeMirrorEditor]);

  useEffect(() => {

    const extension = keymap.of([
      { key: 'mod-alt-ArrowUp', run: view => addMultiCursor(view, 'up') },
      { key: 'mod-alt-ArrowDown', run: view => addMultiCursor(view, 'down') },
    ]);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);
    return cleanupFunction;

  }, [codeMirrorEditor]);

};
