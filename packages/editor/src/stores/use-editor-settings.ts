import { useEffect, useCallback, useState } from 'react';

import { Prec, Extension } from '@codemirror/state';
import {
  keymap, type Command, highlightActiveLine, highlightActiveLineGutter,
} from '@codemirror/view';

import type { EditorSettings } from '../consts';
import type { EditorTheme, KeyMapMode } from '../services';
import { getEditorTheme, getKeymap } from '../services';
import type { UseCodeMirrorEditor } from '../services-ext';
import { insertNewlineContinueMarkup } from '../services/list-util/insert-newline-continue-markup';
import { insertNewRowToMarkdownTable, isInTable } from '../services/table';


export const useEditorSettings = (
    codeMirrorEditor?: UseCodeMirrorEditor,
    editorSetings?: EditorSettings,
    onSave?: () => void,
): void => {

  useEffect(() => {
    if (editorSetings?.styleActiveLine == null) {
      return;
    }
    const extensions = (editorSetings?.styleActiveLine) ? [[highlightActiveLine(), highlightActiveLineGutter()]] : [[]];

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extensions);
    return cleanupFunction;

  }, [codeMirrorEditor, editorSetings?.styleActiveLine]);

  const onPressEnter: Command = useCallback((editor) => {
    if (isInTable(editor) && editorSetings?.autoFormatMarkdownTable) {
      insertNewRowToMarkdownTable(editor);
      return true;
    }
    insertNewlineContinueMarkup(editor);
    return true;
  }, [editorSetings?.autoFormatMarkdownTable]);


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
    settingTheme(editorSetings?.theme);
  }, [codeMirrorEditor, editorSetings?.theme, setThemeExtension]);

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
    settingKeyMap(editorSetings?.keymapMode);

  }, [codeMirrorEditor, editorSetings?.keymapMode, setKeymapExtension, onSave]);

  useEffect(() => {
    if (keymapExtension == null) {
      return;
    }

    // Prevent these Keybind from overwriting the originally defined keymap.
    const cleanupFunction = codeMirrorEditor?.appendExtensions(Prec.low(keymapExtension));
    return cleanupFunction;

  }, [codeMirrorEditor, keymapExtension]);

};
