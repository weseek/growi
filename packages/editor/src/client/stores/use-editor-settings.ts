import { useEffect, useCallback, useState } from 'react';

import type { Extension } from '@codemirror/state';
import { Prec } from '@codemirror/state';
import {
  keymap, type Command, highlightActiveLine, highlightActiveLineGutter,
  EditorView,
} from '@codemirror/view';

import {
  type EditorSettings, type KeyMapMode, type EditorTheme,
  PasteMode,
} from '../../consts';
import type { UseCodeMirrorEditor } from '../services';
import {
  getEditorTheme, getKeymap, insertNewlineContinueMarkup, insertNewRowToMarkdownTable, isInTable, getStrFromBol, adjustPasteData,
} from '../services-internal';


export const useEditorSettings = (
    codeMirrorEditor?: UseCodeMirrorEditor,
    editorSetings?: EditorSettings,
    onSave?: () => void,
    onUpload?: (files: File[]) => void,
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

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      event.preventDefault();

      const editor = codeMirrorEditor?.view;

      if (editor == null) {
        return;
      }

      if (event.clipboardData == null) {
        return;
      }

      if (editorSetings?.pasteMode !== PasteMode.file && event.clipboardData.types.includes('text/plain')) {

        const textData = event.clipboardData.getData('text/plain');

        const strFromBol = getStrFromBol(editor);
        const adjusted = adjustPasteData(strFromBol, textData);

        codeMirrorEditor?.replaceText(adjusted);
      }

      if (editorSetings?.pasteMode !== PasteMode.text && onUpload != null && event.clipboardData.types.includes('Files')) {
        onUpload(Array.from(event.clipboardData.files));
      }

    };

    const extension = EditorView.domEventHandlers({
      paste: handlePaste,
    });

    const cleanupFunction = codeMirrorEditor?.appendExtensions(extension);
    return cleanupFunction;

  }, [codeMirrorEditor, editorSetings?.pasteMode, onUpload]);


};
