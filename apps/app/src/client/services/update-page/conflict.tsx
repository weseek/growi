import { useCallback, useEffect } from 'react';

import { Origin } from '@growi/core';
import type { ErrorV3 } from '@growi/core/dist/models';
import { useGlobalSocket } from '@growi/core/dist/swr';
import { GlobalCodeMirrorEditorKey, useCodeMirrorEditorIsolated } from '@growi/editor';
import { useTranslation } from 'react-i18next';

import { toastSuccess } from '~/client/util/toastr';
import type { Save, SaveOptions } from '~/components/PageEditor/PageEditor';
import { PageUpdateErrorCode } from '~/interfaces/apiv3';
import { SocketEventName } from '~/interfaces/websocket';
import { usePageStatusAlert } from '~/stores/alert';
import { useConflictDiffModal } from '~/stores/modal';
import { useCurrentPageId, useSWRxCurrentPage } from '~/stores/page';
import { type RemoteRevisionData, useSetRemoteLatestPageData } from '~/stores/remote-latest-page';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { useUpdateStateAfterSave } from '../page-operation';

export type ConflictHandler = (
  remoteRevisionData: RemoteRevisionData,
  requestMarkdown: string,
  save: Save,
  saveOptions?: SaveOptions,
) => void;

export const extractRemoteRevisionDataFromErrorObj = (errors: Array<ErrorV3>): RemoteRevisionData | undefined => {
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

type GenerateResolveConflicthandler = () => (
  revisionId: string,
  save: Save,
  saveOptions?: SaveOptions,
  onConflict?: () => void
) => (newMarkdown: string) => Promise<void>

export const useGenerateResolveConflictHandler: GenerateResolveConflicthandler = () => {
  const { t } = useTranslation();

  const { data: pageId } = useCurrentPageId();
  const { close: closePageStatusAlert } = usePageStatusAlert();
  const { close: closeConflictDiffModal } = useConflictDiffModal();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);
  const updateStateAfterSave = useUpdateStateAfterSave(pageId, { supressEditingMarkdownMutation: true });

  return useCallback((revisionId, save, saveOptions, onConflict) => {
    return async(newMarkdown) => {
      const page = await save(revisionId, newMarkdown, saveOptions, onConflict);
      if (page == null) {
        return;
      }

      // Reflect conflict resolution results in CodeMirrorEditor
      codeMirrorEditor?.initDoc(newMarkdown);

      closePageStatusAlert();
      closeConflictDiffModal();

      toastSuccess(t('toaster.save_succeeded'));
      updateStateAfterSave?.();
    };
  }, [closeConflictDiffModal, closePageStatusAlert, codeMirrorEditor, t, updateStateAfterSave]);
};


type ConflictResolver = () => ConflictHandler;

export const useConflictResolver: ConflictResolver = () => {
  const { open: openPageStatusAlert } = usePageStatusAlert();
  const { open: openConflictDiffModal } = useConflictDiffModal();
  const { setRemoteLatestPageData } = useSetRemoteLatestPageData();
  const generateResolveConflictHandler = useGenerateResolveConflictHandler();

  return useCallback((remoteRevidsionData, requestMarkdown, save, saveOptions) => {
    const conflictHandler = () => {
      const resolveConflictHandler = generateResolveConflictHandler(remoteRevidsionData.remoteRevisionId, save, saveOptions, conflictHandler);
      openPageStatusAlert({ onResolveConflict: () => openConflictDiffModal(requestMarkdown, resolveConflictHandler) });
      setRemoteLatestPageData(remoteRevidsionData);
    };

    conflictHandler();
  }, [generateResolveConflictHandler, openConflictDiffModal, openPageStatusAlert, setRemoteLatestPageData]);
};

export const useConflictEffect = (): void => {
  const { data: currentPage } = useSWRxCurrentPage();
  const { close: closePageStatusAlert } = usePageStatusAlert();
  const { close: closeConflictDiffModal } = useConflictDiffModal();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);
  const { open: openPageStatusAlert } = usePageStatusAlert();
  const { open: openConflictDiffModal } = useConflictDiffModal();
  const { data: socket } = useGlobalSocket();
  const { data: editorMode } = useEditorMode();

  const conflictHandler = useCallback(() => {
    const onResolveConflict = () => {
      const resolveConflictHandler = (newMarkdown: string) => {
        codeMirrorEditor?.initDoc(newMarkdown);
        closeConflictDiffModal();
        closePageStatusAlert();
      };

      const markdown = codeMirrorEditor?.getDoc();
      openConflictDiffModal(markdown ?? '', resolveConflictHandler);
    };

    openPageStatusAlert({ onResolveConflict });
  }, [closeConflictDiffModal, closePageStatusAlert, codeMirrorEditor, openConflictDiffModal, openPageStatusAlert]);

  const updateRemotePageDataHandler = useCallback((data) => {
    const { s2cMessagePageUpdated } = data;

    const remoteRevisionId = s2cMessagePageUpdated.revisionId;
    const remoteRevisionOrigin = s2cMessagePageUpdated.revisionOrigin;
    const currentRevisionId = currentPage?.revision?._id;
    const isRevisionOutdated = (currentRevisionId != null || remoteRevisionId != null) && currentRevisionId !== remoteRevisionId;

    // !!CAUTION!! Timing of calling openPageStatusAlert may clash with client/services/side-effects/page-updated.ts
    if (isRevisionOutdated && editorMode === EditorMode.Editor && (remoteRevisionOrigin === Origin.View || remoteRevisionOrigin === undefined)) {
      conflictHandler();
    }

    // Clear cache
    if (!isRevisionOutdated) {
      closePageStatusAlert();
    }
  }, [closePageStatusAlert, currentPage?.revision?._id, editorMode, conflictHandler]);

  useEffect(() => {
    if (socket == null) { return }

    socket.on(SocketEventName.PageUpdated, updateRemotePageDataHandler);

    return () => {
      socket.off(SocketEventName.PageUpdated, updateRemotePageDataHandler);
    };

  }, [socket, updateRemotePageDataHandler]);
};
