import { useCallback } from 'react';

import { Origin } from '@growi/core';
import type { ErrorV3 } from '@growi/core/dist/models';
import { useTranslation } from 'next-i18next';

import { updatePage, useUpdateStateAfterSave } from '~/client/services/page-operation';
import { useDrawioModalLauncherForView } from '~/client/services/side-effects/drawio-modal-launcher-for-view';
import { useHandsontableModalLauncherForView } from '~/client/services/side-effects/handsontable-modal-launcher-for-view';
import { toastSuccess, toastError, toastWarning } from '~/client/util/toastr';
import { useConflictDiffModal } from '~/stores/modal';
import { useCurrentPageId } from '~/stores/page';
import { type RemoteRevisionData, useSetRemoteLatestPageData } from '~/stores/remote-latest-page';

export const PageContentsUtilities = (): null => {
  const { t } = useTranslation();

  const { data: pageId } = useCurrentPageId();
  const { open: openConflictDiffModal, close: closeConflictDiffModal } = useConflictDiffModal();
  const { setRemoteLatestPageData } = useSetRemoteLatestPageData();

  const updateStateAfterSave = useUpdateStateAfterSave(pageId);

  const getConflictInfo = useCallback((errors: Array<ErrorV3>): RemoteRevisionData | undefined => {
    for (const error of errors) {
      if (error.code === 'conflict') {

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

  const generateResolveConflictHandler = useCallback((latestRevisionId: string) => {
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
      }

      catch (errors) {
        const conflictInfo = getConflictInfo(errors);

        if (conflictInfo != null) {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          onConflictHandler(conflictInfo, newMarkdown);
          return;
        }

        toastError(errors);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeConflictDiffModal, pageId, t, updateStateAfterSave]);

  const onConflictHandler = useCallback((remoteRevidsionData: RemoteRevisionData, newMarkdown: string) => {
    // TODO: i18n
    toastWarning('コンフリクトが発生しました。差分を確認してください。');

    setRemoteLatestPageData(remoteRevidsionData);

    const resolveConflictHandler = generateResolveConflictHandler(remoteRevidsionData.remoteRevisionId);
    if (resolveConflictHandler == null) {
      return;
    }

    openConflictDiffModal(newMarkdown, resolveConflictHandler);

  }, [generateResolveConflictHandler, openConflictDiffModal, setRemoteLatestPageData]);

  useHandsontableModalLauncherForView({
    onSaveSuccess: () => {
      toastSuccess(t('toaster.save_succeeded'));

      updateStateAfterSave?.();
    },
    onSaveError: (errors: Array<ErrorV3>, newMarkdown: string) => {
      const conflictInfo = getConflictInfo(errors);

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
      const conflictInfo = getConflictInfo(errors);

      if (conflictInfo != null) {
        onConflictHandler(conflictInfo, newMarkdown);
        return;
      }

      toastError(errors);
    },
  });

  return null;
};
