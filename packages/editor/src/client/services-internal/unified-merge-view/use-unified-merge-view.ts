import { useEffect } from 'react';

import {
  unifiedMergeView,
  originalDocChangeEffect,
  getOriginalDoc,
} from '@codemirror/merge';
import { StateField, ChangeSet } from '@codemirror/state';

import { deltaToChangeSpecs } from '../../../utils/delta-to-changespecs';
import type { UseCodeMirrorEditor } from '../../services';
import { collaborativeChange } from '../../stores/use-collaborative-editor-mode';


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

  // effect for updating orignal document by collaborative changes
  useEffect(() => {
    if (!unifiedMergeViewEnabled || codeMirrorEditor == null) {
      return;
    }

    const extension = StateField.define({
      create: () => null,
      update(value, tr) {
        if (codeMirrorEditor.state == null) {
          return value;
        }

        for (const e of tr.effects) {
          if (e.is(collaborativeChange)) {
            const changeSpecs = deltaToChangeSpecs(e.value);
            const changeSet = ChangeSet.of(changeSpecs, getOriginalDoc(tr.state).length);
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
    });

    const cleanupFunction = codeMirrorEditor.appendExtensions(extension);
    return cleanupFunction;
  }, [codeMirrorEditor, unifiedMergeViewEnabled]);
};
