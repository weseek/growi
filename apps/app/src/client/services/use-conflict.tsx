import { useCallback } from 'react';

import type { ErrorV3 } from '@growi/core/dist/models';
import { GlobalCodeMirrorEditorKey, useCodeMirrorEditorIsolated } from '@growi/editor';

import { PageUpdateErrorCode } from '~/interfaces/apiv3';
import { useIsConflict } from '~/stores/editor';
import { useConflictDiffModal } from '~/stores/modal';
import { useCurrentPageId } from '~/stores/page';
import { type RemoteRevisionData, useSetRemoteLatestPageData } from '~/stores/remote-latest-page';

import { useUpdateStateAfterSave } from './page-operation';

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
