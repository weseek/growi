import { useCallback } from 'react';

import { Origin } from '@growi/core';
import type { ErrorV3 } from '@growi/core/dist/models';
import { GlobalCodeMirrorEditorKey, useCodeMirrorEditorIsolated } from '@growi/editor';
import { useTranslation } from 'react-i18next';

import { PageUpdateErrorCode } from '~/interfaces/apiv3';
import { useIsConflict } from '~/stores/editor';
import { useConflictDiffModal } from '~/stores/modal';
import { useCurrentPageId } from '~/stores/page';
import { type RemoteRevisionData, useSetRemoteLatestPageData } from '~/stores/remote-latest-page';

import { toastError, toastSuccess, toastWarning } from '../util/toastr';

import { updatePage, useUpdateStateAfterSave } from './page-operation';

export const extractConflictDataFromErrorObj = (errors: Array<ErrorV3>): RemoteRevisionData | undefined => {
  for (const error of errors) {
    if (error.code === PageUpdateErrorCode.CONFLICT) {

      const latestRevision = error.args.returnLatestRevision;

      const remoteRevidsionData = {
        remoteRevisionId: latestRevision.revisionId,
        remoteRevisionBody: latestRevision.revisionBody,
        remoteRevisionLastUpdateUser: latestRevision.user,
        remoteRevisionLastUpdatedAt: latestRevision.createdAt,
      };

      return remoteRevidsionData;
    }
  }
};


/*
* For Editor
*/
const useResolveConflictHandlerForEditor = (): (newMarkdown: string) => void => {
  const { data: pageId } = useCurrentPageId();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);
  const { close: closeConflictDiffModal } = useConflictDiffModal();
  const updateStateAfterSave = useUpdateStateAfterSave(pageId, { supressEditingMarkdownMutation: true });

  return useCallback((newMarkdown: string) => {
    codeMirrorEditor?.initDoc(newMarkdown);
    updateStateAfterSave?.();
    closeConflictDiffModal();

    return;
  }, [closeConflictDiffModal, codeMirrorEditor, updateStateAfterSave]);
};

export const useOnConflictHandlerForEditor = (): (remoteRevidsionData: RemoteRevisionData) => void => {
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);
  const { mutate: mutateIsConflict } = useIsConflict();
  const { open: openConflictDiffModal } = useConflictDiffModal();
  const { setRemoteLatestPageData } = useSetRemoteLatestPageData();
  const resolveConflictHandler = useResolveConflictHandlerForEditor();

  return useCallback((remoteRevidsionData: RemoteRevisionData) => {
    const newMarkdown = codeMirrorEditor?.getDoc();

    setRemoteLatestPageData(remoteRevidsionData);
    mutateIsConflict(true);
    openConflictDiffModal(newMarkdown ?? '', resolveConflictHandler);

    return;
  }, [codeMirrorEditor, mutateIsConflict, openConflictDiffModal, resolveConflictHandler, setRemoteLatestPageData]);
};


/*
* For View
*/
// eslint-disable-next-line max-len
const useGenerateResolveConflictHandlerForView = (): (revisionId: string, onConflict?: (conflictData: RemoteRevisionData, newMarkdown: string) => void) => (newMarkdown: string) => Promise<void> => {
  const { t } = useTranslation();
  const { data: pageId } = useCurrentPageId();
  const { close: closeConflictDiffModal } = useConflictDiffModal();

  const updateStateAfterSave = useUpdateStateAfterSave(pageId);

  return useCallback((revisionId, onConflict) => {
    return async(newMarkdown) => {

      if (pageId == null) {
        return;
      }

      try {
        await updatePage({
          pageId,
          revisionId,
          body: newMarkdown,
          origin: Origin.View,
        });

        toastSuccess(t('toaster.save_succeeded'));
        updateStateAfterSave?.();
        closeConflictDiffModal();

        // TODO: If no user is editing in the Editor, update ydoc as well
        // https://redmine.weseek.co.jp/issues/142109
      }

      catch (errors) {
        const conflictData = extractConflictDataFromErrorObj(errors);

        if (conflictData != null) {
          // Called if conflicts occur after resolving conflicts
          onConflict?.(conflictData, newMarkdown);
          return;
        }

        toastError(errors);
      }
    };
  }, [closeConflictDiffModal, pageId, t, updateStateAfterSave]);
};

export const useOnConflictHandlerForView = (): (remoteRevidsionData: RemoteRevisionData, newMarkdown: string) => void => {
  const { t } = useTranslation();
  const { setRemoteLatestPageData } = useSetRemoteLatestPageData();
  const { open: openConflictDiffModal } = useConflictDiffModal();

  const generateResolveConflictHandler = useGenerateResolveConflictHandlerForView();

  return useCallback((remoteRevidsionData, newMarkdown) => {
    const onConflict = (remoteRevidsionData: RemoteRevisionData, newMarkdown: string) => {
      toastWarning(t('modal_resolve_conflict.file_conflicting_with_newer_remote_and_resolve_conflict'));
      setRemoteLatestPageData(remoteRevidsionData);

      const resolveConflictHandler = generateResolveConflictHandler(remoteRevidsionData.remoteRevisionId, onConflict);

      openConflictDiffModal(newMarkdown, resolveConflictHandler);
    };

    onConflict(remoteRevidsionData, newMarkdown);
  }, [generateResolveConflictHandler, openConflictDiffModal, setRemoteLatestPageData, t]);
};
