import { useEffect } from 'react';

import {
  unifiedMergeView,
  // originalDocChangeEffect,
  // getOriginalDoc,
} from '@codemirror/merge';
// import { StateField, ChangeSet } from '@codemirror/state';

import * as Y from 'yjs';

// import { CollaborativeChange } from '../../../consts/collaborative-change';
// import { deltaToChangeSpecs } from '../../../utils/delta-to-changespecs';
import type { UseCodeMirrorEditor } from '../../services';
import { useSecondaryYdocs } from '../../stores/use-secondary-ydocs';


type Configuration = {
  pageId?: string,
}

export const useUnifiedMergeView = (
    isEnabled = false,
    codeMirrorEditor?: UseCodeMirrorEditor,
    configuration?: Configuration,
): void => {

  // const { pageId } = configuration ?? {};

  // const { primaryDoc, secondaryDoc } = useSecondaryYdocs({
  //   isEnabled,
  //   pageId,
  //   useSecondary: isEnabled,
  // }) ?? {};

  // setup unifiedMergeView
  // useEffect(() => {
  //   if (!isEnabled || primaryDoc == null || secondaryDoc == null || codeMirrorEditor == null) {
  //     return;
  //   }

  //   const extension = isEnabled ? [
  //     unifiedMergeView({
  //       original: primaryDoc.getText('codemirror').toString(),
  //     }),
  //   ] : [];

  //   const cleanupFunction = codeMirrorEditor?.appendExtensions(extension);
  //   return cleanupFunction;
  // }, [isEnabled, pageId, codeMirrorEditor, primaryDoc, secondaryDoc]);

  // effect for updating orignal document by collaborative changes
  // useEffect(() => {
  //   if (!isEnabled || codeMirrorEditor == null) {
  //     return;
  //   }

  //   const extension = StateField.define({
  //     create: () => null,
  //     update(value, tr) {
  //       for (const e of tr.effects) {
  //         if (e.is(CollaborativeChange)) {
  //           const changeSpecs = deltaToChangeSpecs(e.value);
  //           const changeSet = ChangeSet.of(changeSpecs, getOriginalDoc(tr.state).length);
  //           const effect = originalDocChangeEffect(tr.state, changeSet);
  //           setTimeout(() => {
  //             codeMirrorEditor.view?.dispatch({
  //               effects: effect,
  //             });
  //           }, 0);
  //         }
  //       }

  //       return value;
  //     },
  //   });

  //   const cleanupFunction = codeMirrorEditor.appendExtensions(extension);
  //   return cleanupFunction;
  // }, [codeMirrorEditor, isEnabled]);
};
