import { useEffect } from 'react';

import { indentUnit } from '@codemirror/language';
import { Compartment, type Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';

import { GlobalCodeMirrorEditorKey } from '../consts';
import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor } from '.';


const additionalExtensions: Extension[] = [
  scrollPastEnd(),
];


type Props = {
  onChange?: (value: string) => void,
  onSave?: () => void,
  indentSize?: number,
}

export const CodeMirrorEditorMain = (props: Props): JSX.Element => {
  const {
    onSave, onChange, indentSize,
  } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  // setup additional extensions
  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  // set handler to save with shortcut key
  useEffect(() => {
    if (onSave == null) {
      return;
    }

    const extension = [keymap.of([{
      key: 'Mod-s',
      preventDefault: true,
      run: () => {
        const doc = codeMirrorEditor?.getDoc();
        if (doc != null) {
          onSave();
        }
        return true;
      },
    },
    ]),
    ];

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);

    return cleanupFunction;
  }, [codeMirrorEditor, onSave]);

  // Change indentUnit size
  useEffect(() => {
    if (indentSize == null) {
      return;
    }

    const extension = indentUnit.of(' '.repeat(indentSize));

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);

    return cleanupFunction;
    // const compartment = new Compartment();
    // codeMirrorEditor?.view?.dispatch({
    //   effects: compartment.reconfigure(indentUnit.of(' '.repeat(indentSize))),
    // });


  }, [codeMirrorEditor, indentSize]);

  return (
    <CodeMirrorEditor
      editorKey={GlobalCodeMirrorEditorKey.MAIN}
      onChange={onChange}
    />
  );
};
