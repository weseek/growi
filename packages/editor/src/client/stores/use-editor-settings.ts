import { useEffect, useCallback, useState } from 'react';

import type { Extension } from '@codemirror/state';
import { Prec } from '@codemirror/state';
import {
  keymap, type Command, highlightActiveLine, highlightActiveLineGutter,
} from '@codemirror/view';

import {
  type EditorSettings, type KeyMapMode, type EditorTheme,
} from '../../consts';
import type { UseCodeMirrorEditor } from '../services';
import {
  getEditorTheme, getKeymap, insertNewlineContinueMarkup, insertNewRowToMarkdownTable, isInTable,
} from '../services-internal';


export const useEditorSettings = (
    codeMirrorEditor?: UseCodeMirrorEditor,
    editorSettings?: EditorSettings,
    onSave?: () => void,
): void => {

  useEffect(() => {
    if (editorSettings?.styleActiveLine == null) {
      return;
    }
    const extensions = (editorSettings?.styleActiveLine) ? [[highlightActiveLine(), highlightActiveLineGutter()]] : [[]];

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extensions);
    return cleanupFunction;

  }, [codeMirrorEditor, editorSettings?.styleActiveLine]);

  const onPressEnter: Command = useCallback((editor) => {
    if (isInTable(editor) && editorSettings?.autoFormatMarkdownTable) {
      insertNewRowToMarkdownTable(editor);
      return true;
    }
    insertNewlineContinueMarkup(editor);
    return true;
  }, [editorSettings?.autoFormatMarkdownTable]);


  useEffect(() => {

    const extension = keymap.of([
      { key: 'Enter', run: onPressEnter },
    ]);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);
    return cleanupFunction;

  }, [codeMirrorEditor, onPressEnter]);

  const [themeExtension, setThemeExtension] = useState<Extension | undefined>(undefined);
  useEffect(() => {
    const settingTheme = async(name?: EditorTheme) => {
      setThemeExtension(await getEditorTheme(name));
    };
    settingTheme(editorSettings?.theme);
  }, [codeMirrorEditor, editorSettings?.theme, setThemeExtension]);

  useEffect(() => {
    if (themeExtension == null) {
      return;
    }
    // React CodeMirror has default theme which is default prec
    // and extension have to be higher prec here than default theme.
    const cleanupFunction = codeMirrorEditor?.appendExtensions(Prec.high(themeExtension));
    return cleanupFunction;
  }, [codeMirrorEditor, themeExtension]);


  const [keymapExtension, setKeymapExtension] = useState<Extension | undefined>(undefined);
  useEffect(() => {
    const settingKeyMap = async(name?: KeyMapMode) => {
      setKeymapExtension(await getKeymap(name, onSave));
    };
    settingKeyMap(editorSettings?.keymapMode);

  }, [codeMirrorEditor, editorSettings?.keymapMode, setKeymapExtension, onSave]);

  useEffect(() => {
    if (keymapExtension == null) {
      return;
    }

    // Prevent these Keybind from overwriting the originally defined keymap.
    const cleanupFunction = codeMirrorEditor?.appendExtensions(Prec.low(keymapExtension));
    return cleanupFunction;

  }, [codeMirrorEditor, keymapExtension]);


};
