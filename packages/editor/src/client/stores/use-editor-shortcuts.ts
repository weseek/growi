import { useEffect } from 'react';

import type { SelectionRange, Extension } from '@codemirror/state';
import { EditorSelection, type ChangeSpec } from '@codemirror/state';
import {
  keymap, type Command, EditorView, type KeyBinding,
} from '@codemirror/view';

import type { UseCodeMirrorEditor } from '../services';
import type { InsertMarkdownElements } from '../services/use-codemirror-editor/utils/insert-markdown-elements';
import { useInsertMarkdownElements } from '../services/use-codemirror-editor/utils/insert-markdown-elements';
import { useInsertPrefix } from '../services/use-codemirror-editor/utils/insert-prefix';
import type { InsertPrefix } from '../services/use-codemirror-editor/utils/insert-prefix';

import type { KeyMapMode } from 'src/consts';

const generateAddMarkdownSymbolCommand = (
    insertMarkdown: InsertMarkdownElements | InsertPrefix,
    prefix: string,
    suffix?: string,
): Command => {

  const isInsertMarkdownElements = (
      fn: InsertMarkdownElements | InsertPrefix,
  ): fn is InsertMarkdownElements => {
    return fn.length === 2;
  };

  const addMarkdownSymbolCommand: Command = () => {
    if (isInsertMarkdownElements(insertMarkdown)) {
      if (suffix == null) return false;
      insertMarkdown(prefix, suffix);
    }
    else {
      insertMarkdown(prefix);
    }

    return true;
  };

  return addMarkdownSymbolCommand;
};

const makeTextCodeBlock: Command = (view: EditorView) => {
  const state = view.state;
  const doc = state.doc;
  const changes: ChangeSpec[] = [];
  const newSelections: SelectionRange[] = [];

  state.selection.ranges.forEach((range) => {
    const startLine = doc.lineAt(range.from);
    const endLine = doc.lineAt(range.to);
    const selectedText = doc.sliceString(range.from, range.to, '');
    const isAlreadyWrapped = selectedText.startsWith('```') && selectedText.endsWith('```');

    const codeBlockMarkerLength = 4;

    if (isAlreadyWrapped) {
      const startMarkerEnd = startLine.from + codeBlockMarkerLength;
      const endMarkerStart = endLine.to - codeBlockMarkerLength;

      changes.push({
        from: startLine.from,
        to: startMarkerEnd,
        insert: '',
      });

      changes.push({
        from: endMarkerStart,
        to: endLine.to,
        insert: '',
      });

      newSelections.push(EditorSelection.range(startLine.from, endMarkerStart - codeBlockMarkerLength));
    }
    else {
      // Add code block markers
      changes.push({
        from: startLine.from,
        insert: '```\n',
      });

      changes.push({
        from: endLine.to,
        insert: '\n```',
      });

      if (selectedText.length === 0) {
        newSelections.push(EditorSelection.cursor(startLine.from + codeBlockMarkerLength));
      }
      else {
        newSelections.push(EditorSelection.range(startLine.from, endLine.to + codeBlockMarkerLength * 2));
      }
    }
  });

  view.dispatch({
    changes,
    selection: EditorSelection.create(newSelections),
  });

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

    if (event.code === 'KeyC' && event.shiftKey && event.altKey && isModKey) {
      event.preventDefault();
      makeTextCodeBlock(view);
      return true;
    }

    return false;
  },
});

export const useCustomKeyBindings = (view?: EditorView, keyMapName?: KeyMapMode): KeyBinding[] => {

  const insertMarkdownElements = useInsertMarkdownElements(view);

  const customKeyBindings: KeyBinding[] = [];
  switch (keyMapName) {
    case 'vim':
      customKeyBindings.push(
        { key: 'mod-shift-b', run: generateAddMarkdownSymbolCommand(insertMarkdownElements, '**', '**') },
      );
      break;
    default:
      customKeyBindings.push(
        { key: 'mod-b', run: generateAddMarkdownSymbolCommand(insertMarkdownElements, '**', '**') },
      );
  }
  return customKeyBindings;
};

export const useKeyBindings = (view?: EditorView, customKeyBindings?: KeyBinding[]): KeyBinding[] => {

  const insertMarkdownElements = useInsertMarkdownElements(view);
  const insertPrefix = useInsertPrefix(view);

  const keyBindings: KeyBinding[] = [
    { key: 'mod-shift-i', run: generateAddMarkdownSymbolCommand(insertMarkdownElements, '*', '*') },
    { key: 'mod-shift-x', run: generateAddMarkdownSymbolCommand(insertMarkdownElements, '~~', '~~') },
    { key: 'mod-shift-c', run: generateAddMarkdownSymbolCommand(insertMarkdownElements, '`', '`') },
    { key: 'mod-shift-7', run: generateAddMarkdownSymbolCommand(insertPrefix, '1.') },
    { key: 'mod-shift-8', run: generateAddMarkdownSymbolCommand(insertPrefix, '-') },
    { key: 'mod-shift-9', run: generateAddMarkdownSymbolCommand(insertPrefix, '>') },
    { key: 'mod-shift-u', run: generateAddMarkdownSymbolCommand(insertMarkdownElements, '[', ']()') },
    { key: 'mod-alt-ArrowUp', run: view => addMultiCursor(view, 'up') },
    { key: 'mod-alt-ArrowDown', run: view => addMultiCursor(view, 'down') },
  ];

  if (customKeyBindings != null) {
    keyBindings.push(...customKeyBindings);
  }

  return keyBindings;
};

export const useKeyboardShortcuts = (codeMirrorEditor?: UseCodeMirrorEditor, keyBindings?: KeyBinding[]): void => {

  useEffect(() => {
    const cleanupFunction = codeMirrorEditor?.appendExtensions?.([makeCodeBlockExtension]);
    return cleanupFunction;
  }, [codeMirrorEditor]);

  useEffect(() => {

    if (keyBindings == null) {
      return;
    }

    const keyboardShortcutsExtension = keymap.of(keyBindings);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(keyboardShortcutsExtension);
    return cleanupFunction;

  }, [codeMirrorEditor, keyBindings]);

};
