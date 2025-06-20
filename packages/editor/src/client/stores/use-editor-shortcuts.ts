import { useEffect } from 'react';

import type { EditorView } from '@codemirror/view';
import {
  keymap, type Command, type KeyBinding,
} from '@codemirror/view';

import type { UseCodeMirrorEditor } from '../services';
import { useAddMultiCursorCommand } from '../services/use-codemirror-editor/utils/add-multi-cursor';
import type { InsertMarkdownElements } from '../services/use-codemirror-editor/utils/insert-markdown-elements';
import { useInsertMarkdownElements } from '../services/use-codemirror-editor/utils/insert-markdown-elements';
import { useInsertPrefix } from '../services/use-codemirror-editor/utils/insert-prefix';
import type { InsertPrefix } from '../services/use-codemirror-editor/utils/insert-prefix';
import { useMakeCodeBlockExtension } from '../services/use-codemirror-editor/utils/make-text-code-block';

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

const useCustomKeyBindings = (view?: EditorView, keyMapName?: KeyMapMode): KeyBinding[] => {

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

const useKeyBindings = (view?: EditorView, customKeyBindings?: KeyBinding[]): KeyBinding[] => {

  const insertMarkdownElements = useInsertMarkdownElements(view);
  const insertPrefix = useInsertPrefix(view);
  const upMultiCursorCommand = useAddMultiCursorCommand('up');
  const downMultiCursorCommand = useAddMultiCursorCommand('down');

  const keyBindings: KeyBinding[] = [
    { key: 'mod-shift-i', run: generateAddMarkdownSymbolCommand(insertMarkdownElements, '*', '*') },
    { key: 'mod-shift-x', run: generateAddMarkdownSymbolCommand(insertMarkdownElements, '~~', '~~') },
    { key: 'mod-shift-c', run: generateAddMarkdownSymbolCommand(insertMarkdownElements, '`', '`') },
    { key: 'mod-shift-7', run: generateAddMarkdownSymbolCommand(insertPrefix, '1.') },
    { key: 'mod-shift-8', run: generateAddMarkdownSymbolCommand(insertPrefix, '-') },
    { key: 'mod-shift-9', run: generateAddMarkdownSymbolCommand(insertPrefix, '>') },
    { key: 'mod-shift-u', run: generateAddMarkdownSymbolCommand(insertMarkdownElements, '[', ']()') },
    { key: 'mod-alt-ArrowUp', run: upMultiCursorCommand },
    { key: 'mod-alt-ArrowDown', run: downMultiCursorCommand },
  ];

  if (customKeyBindings != null) {
    keyBindings.push(...customKeyBindings);
  }

  return keyBindings;
};

export const useKeyboardShortcuts = (codeMirrorEditor?: UseCodeMirrorEditor, keymapModeName?: KeyMapMode): void => {

  const customKeyBindings = useCustomKeyBindings(codeMirrorEditor?.view, keymapModeName);
  const keyBindings = useKeyBindings(codeMirrorEditor?.view, customKeyBindings);

  const makeCodeBlockExtension = useMakeCodeBlockExtension();

  useEffect(() => {
    const cleanupFunction = codeMirrorEditor?.appendExtensions?.([makeCodeBlockExtension]);
    return cleanupFunction;
  }, [codeMirrorEditor, makeCodeBlockExtension]);

  useEffect(() => {

    if (keyBindings == null) {
      return;
    }

    const keyboardShortcutsExtension = keymap.of(keyBindings);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(keyboardShortcutsExtension);
    return cleanupFunction;

  }, [codeMirrorEditor, keyBindings]);

};
