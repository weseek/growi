import { useEffect } from 'react';

import {
  unifiedMergeView,
  originalDocChangeEffect,
  getOriginalDoc,
} from '@codemirror/merge';
import { StateField, ChangeSet } from '@codemirror/state';

import { CollaborativeChange } from '../../../consts/collaborative-change';
import { deltaToChangeSpecs } from '../../../utils/delta-to-changespecs';
import type { UseCodeMirrorEditor } from '../../services';


export const useUnifiedMergeView = (
    unifiedMergeViewEnabled?: boolean,
    codeMirrorEditor?: UseCodeMirrorEditor,
): void => {

  // setup unifiedMergeView
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
        for (const e of tr.effects) {
          if (e.is(CollaborativeChange)) {
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
