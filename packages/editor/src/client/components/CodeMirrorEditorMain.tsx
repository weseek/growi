import { useEffect, useMemo, type JSX } from 'react';

import { type Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';
import type { IUserHasId } from '@growi/core/dist/interfaces';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import deepmerge from 'ts-deepmerge';

import { GlobalCodeMirrorEditorKey } from '../../consts';
import { CodeMirrorEditor, type CodeMirrorEditorProps } from '../components-internal/CodeMirrorEditor';
import { setDataLine } from '../services-internal';
import { useCodeMirrorEditorIsolated } from '../stores/codemirror-editor';
import { useCollaborativeEditorMode } from '../stores/use-collaborative-editor-mode';


const additionalExtensions: Extension[] = [
  [
    scrollPastEnd(),
    setDataLine,
  ],
];

type Props = CodeMirrorEditorProps & {
  user?: IUserHasId,
  pageId?: string,
  initialValue?: string,
  isEditorMode: boolean,
  onEditorsUpdated?: (userList: IUserHasId[]) => void,
}

export const CodeMirrorEditorMain = (props: Props): JSX.Element => {
  const {
    user, pageId, initialValue, isEditorMode, cmProps,
    onSave, onEditorsUpdated, ...otherProps
  } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  useCollaborativeEditorMode(isEditorMode, user, pageId, initialValue, onEditorsUpdated, codeMirrorEditor);

  // setup additional extensions
  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  // set handler to save with shortcut key
  useEffect(() => {
    if (onSave == null) {
      return;
    }

    const extension = keymap.of([
      {
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
    ]);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);

    return cleanupFunction;
  }, [codeMirrorEditor, onSave]);

  const cmPropsOverride = useMemo<ReactCodeMirrorProps>(() => deepmerge(
    cmProps ?? {},
    {
      // Disable the basic history configuration since this component uses Y.UndoManager instead
      basicSetup: {
        history: false,
      },
    },
  ), [cmProps]);

  return (
    <CodeMirrorEditor
      editorKey={GlobalCodeMirrorEditorKey.MAIN}
      onSave={onSave}
      cmProps={cmPropsOverride}
      {...otherProps}
    />
  );
};
