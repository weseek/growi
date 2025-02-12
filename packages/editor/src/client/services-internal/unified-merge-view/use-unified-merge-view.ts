import { useEffect } from 'react';

import {
  unifiedMergeView,
  originalDocChangeEffect,
  getOriginalDoc,
} from '@codemirror/merge';
import { ChangeSet, type ChangeSpec, StateField } from '@codemirror/state';

import type { Delta } from '../../../interfaces';
import type { UseCodeMirrorEditor } from '../../services';
import { collaborativeChange } from '../../stores/use-collaborative-editor-mode';


function deltaToChangeSet(delta: Delta, docLength: number): ChangeSet {
  const changes: ChangeSpec[] = [];
  let pos = 0;

  for (const op of delta) {
    if (op.retain != null) {
      pos += op.retain;
    }

    if (op.delete != null) {
      changes.push({
        from: pos,
        to: pos + op.delete,
      });
    }

    if (op.insert != null) {
      changes.push({
        from: pos,
        insert: typeof op.insert === 'string' ? op.insert : '',
      });
      if (typeof op.insert === 'string') {
        pos += op.insert.length;
      }
    }
  }

  return ChangeSet.of(changes, docLength);
}


export const useUnifiedMergeView = (
    unifiedMergeViewEnabled?: boolean,
    codeMirrorEditor?: UseCodeMirrorEditor,
): void => {

  useEffect(() => {
    if (unifiedMergeViewEnabled == null || !codeMirrorEditor) {
      return;
    }

    const extension = unifiedMergeViewEnabled ? [
      unifiedMergeView({
        original: codeMirrorEditor.getDoc(),
      }),
    ] : [];

    const cleanupFunction = codeMirrorEditor.appendExtensions(extension);
    return cleanupFunction;
  }, [codeMirrorEditor, unifiedMergeViewEnabled]);

  useEffect(() => {
    if (!unifiedMergeViewEnabled || codeMirrorEditor == null) {
      return;
    }

    const extension = unifiedMergeViewEnabled ? [
      // collaborative changes を追跡し、original document を更新する
      StateField.define({
        create: () => null,
        update(value, tr) {
          if (codeMirrorEditor.view?.state == null) {
            return value;
          }

          for (const e of tr.effects) {
            if (e.is(collaborativeChange)) {
              // original document を更新
              const changeSet = deltaToChangeSet(e.value, getOriginalDoc(codeMirrorEditor.view.state).length);
              const effect = originalDocChangeEffect(tr.state, changeSet);
              setTimeout(() => {
                codeMirrorEditor.view?.dispatch({
                  effects: effect,
                });
              }, 0);
            }
          }
          return value;
        },
      }),
    ] : [];

    const cleanupFunction = codeMirrorEditor.appendExtensions(extension);
    return cleanupFunction;
  }, [codeMirrorEditor, unifiedMergeViewEnabled]);
};
