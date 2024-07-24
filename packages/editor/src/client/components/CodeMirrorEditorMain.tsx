import { useEffect } from 'react';

import { type Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';
import type { IUserHasId } from '@growi/core/dist/interfaces';

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
  isEditorMode: boolean,
  revisionBody?: string,
  isYjsEnabled: boolean,
  onEditorsUpdated?: (userList: IUserHasId[]) => void,
}

export const CodeMirrorEditorMain = (props: Props): JSX.Element => {
  const {
    user, pageId, revisionBody, onSave, onEditorsUpdated, isEditorMode, isYjsEnabled, ...otherProps
  } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  useCollaborativeEditorMode(isYjsEnabled, user, pageId, onEditorsUpdated, codeMirrorEditor);

  // Insert latest revisionBody when yjs is disabled
  useEffect(() => {
    if (!isYjsEnabled && isEditorMode) {
      console.log('発火');
      codeMirrorEditor?.initDoc(revisionBody);
    }
  }, [codeMirrorEditor, isEditorMode, isYjsEnabled, revisionBody]);

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

  return (
    <CodeMirrorEditor
      editorKey={GlobalCodeMirrorEditorKey.MAIN}
      onSave={onSave}
      {...otherProps}
    />
  );
};
