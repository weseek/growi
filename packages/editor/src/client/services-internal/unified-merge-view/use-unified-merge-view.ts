import { useEffect } from 'react';

import {
  unifiedMergeView,
  originalDocChangeEffect,
  getOriginalDoc,
} from '@codemirror/merge';
import {
  ChangeSet, Transaction,
} from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import * as Y from 'yjs';

import { deltaToChangeSpecs } from '../../../utils/delta-to-changespecs';
import type { UseCodeMirrorEditor } from '../../services';
import { useSecondaryYdocs } from '../../stores/use-secondary-ydocs';


type Configuration = {
  pageId?: string,
}

export const useUnifiedMergeView = (
    isEnabled: boolean,
    codeMirrorEditor?: UseCodeMirrorEditor,
    configuration?: Configuration,
): void => {

  const { pageId } = configuration ?? {};

  const { primaryDoc, secondaryDoc } = useSecondaryYdocs(isEnabled, {
    pageId,
    useSecondary: isEnabled,
  }) ?? {};

  // setup unifiedMergeView
  useEffect(() => {
    if (!isEnabled || primaryDoc == null || secondaryDoc == null || codeMirrorEditor == null) {
      return;
    }

    const extension = isEnabled ? [
      unifiedMergeView({
        original: codeMirrorEditor.getDoc(),
      }),
    ] : [];

    const cleanupFunction = codeMirrorEditor?.appendExtensions(extension);
    return cleanupFunction;
  }, [isEnabled, pageId, codeMirrorEditor, primaryDoc, secondaryDoc]);

  // Setup sync from primaryDoc to secondaryDoc
  useEffect(() => {
    if (!isEnabled || primaryDoc == null || secondaryDoc == null || codeMirrorEditor == null) {
      return;
    }

    const primaryYText = primaryDoc.getText('codemirror');

    const sync = (event: Y.YTextEvent) => {
      if (event.transaction.local) return;

      if (codeMirrorEditor?.view?.state == null) {
        return;
      }

      // sync from primaryDoc to secondaryDoc
      Y.applyUpdate(secondaryDoc, Y.encodeStateAsUpdate(primaryDoc));

      // sync from primaryDoc to original document
      if (codeMirrorEditor?.view?.state != null) {
        const changeSpecs = deltaToChangeSpecs(event.delta);
        const originalDoc = getOriginalDoc(codeMirrorEditor.view.state);
        const changeSet = ChangeSet.of(changeSpecs, originalDoc.length);
        const effect = originalDocChangeEffect(codeMirrorEditor.view.state, changeSet);

        // Dispatch in next tick to ensure state is updated
        setTimeout(() => {
          codeMirrorEditor.view?.dispatch({
            effects: effect,
          });
        }, 0);
      }
    };

    primaryYText.observe(sync);

    // cleanup
    return () => {
      primaryYText.unobserve(sync);
    };
  }, [codeMirrorEditor, isEnabled, primaryDoc, secondaryDoc]);

  // Setup sync from secondaryDoc to primaryDoc when accepting chunks
  useEffect(() => {
    if (!isEnabled || primaryDoc == null || secondaryDoc == null || codeMirrorEditor == null) {
      return;
    }

    // EditorView.updateListener を使用
    const extension = EditorView.updateListener.of((update) => {
      // handle only when the transaction has `userEvent: 'accept'` annotation
      // ref: https://github.com/codemirror/merge/blob/6.8.0/src/unified.ts#L220
      const shouldSync = update.transactions.some((tr) => {
        const userEventAnnotation = tr.annotation(Transaction.userEvent);
        return userEventAnnotation === 'accept';
      });

      if (shouldSync) {
        Y.applyUpdate(primaryDoc, Y.encodeStateAsUpdate(secondaryDoc));
      }
    });

    const cleanup = codeMirrorEditor?.appendExtensions([extension]);

    return () => {
      cleanup?.();
    };
  }, [codeMirrorEditor, isEnabled, primaryDoc, secondaryDoc]);

};
