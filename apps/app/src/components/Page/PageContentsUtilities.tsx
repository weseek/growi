import { useCallback } from 'react';

import { Origin } from '@growi/core';
import type { ErrorV3 } from '@growi/core/dist/models';
import { useTranslation } from 'next-i18next';

import { updatePage, useUpdateStateAfterSave } from '~/client/services/page-operation';
import { useDrawioModalLauncherForView } from '~/client/services/side-effects/drawio-modal-launcher-for-view';
import { useHandsontableModalLauncherForView } from '~/client/services/side-effects/handsontable-modal-launcher-for-view';
import { toastSuccess, toastError, toastWarning } from '~/client/util/toastr';
import { PageUpdateErrorCode } from '~/interfaces/apiv3';
import { useConflictDiffModal } from '~/stores/modal';
import { useCurrentPageId } from '~/stores/page';
import { type RemoteRevisionData, useSetRemoteLatestPageData } from '~/stores/remote-latest-page';

export const PageContentsUtilities = (): null => {
  const { t } = useTranslation();

  const { data: pageId } = useCurrentPageId();
  const { open: openConflictDiffModal, close: closeConflictDiffModal } = useConflictDiffModal();
  const { setRemoteLatestPageData } = useSetRemoteLatestPageData();

  const updateStateAfterSave = useUpdateStateAfterSave(pageId);

  const getConflictData = useCallback((errors: Array<ErrorV3>): RemoteRevisionData | undefined => {
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
  }, []);

  const generateResolveConflictHandler = useCallback((
      latestRevisionId: string,
      onConflict?: (conflictInfo: RemoteRevisionData, newMarkdown: string) => void,
  ) => {
    if (pageId == null) {
      return;
    }

    return async(newMarkdown: string) => {
      try {
        await updatePage({
          pageId,
          revisionId: latestRevisionId,
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
        const conflictInfo = getConflictData(errors);

        if (conflictInfo != null) {
          // Called if conflicts occur after resolving conflicts
          onConflict?.(conflictInfo, newMarkdown);
          return;
        }

        toastError(errors);
      }
    };
  }, [closeConflictDiffModal, getConflictData, pageId, t, updateStateAfterSave]);

  const onConflictHandler = useCallback((remoteRevidsionData: RemoteRevisionData, newMarkdown: string) => {
    toastWarning(t('modal_resolve_conflict.file_conflicting_with_newer_remote_and_resolve_conflict'));

    setRemoteLatestPageData(remoteRevidsionData);

    const resolveConflictHandler = generateResolveConflictHandler(remoteRevidsionData.remoteRevisionId, onConflictHandler);
    if (resolveConflictHandler == null) {
      return;
    }

    openConflictDiffModal(newMarkdown, resolveConflictHandler);

  }, [generateResolveConflictHandler, openConflictDiffModal, setRemoteLatestPageData, t]);

  useHandsontableModalLauncherForView({
    onSaveSuccess: () => {
      toastSuccess(t('toaster.save_succeeded'));

      updateStateAfterSave?.();
    },
    onSaveError: (errors: Array<ErrorV3>, newMarkdown: string) => {
      const conflictInfo = getConflictData(errors);

      if (conflictInfo != null) {
        onConflictHandler(conflictInfo, newMarkdown);
        return;
      }

      toastError(errors);
    },
  });

  useDrawioModalLauncherForView({
    onSaveSuccess: () => {
      toastSuccess(t('toaster.save_succeeded'));

      updateStateAfterSave?.();
    },
    onSaveError: (errors: Array<ErrorV3>, newMarkdown: string) => {
      const conflictInfo = getConflictData(errors);

      if (conflictInfo != null) {
        onConflictHandler(conflictInfo, newMarkdown);
        return;
      }

      toastError(errors);
    },
  });

  return null;
};
