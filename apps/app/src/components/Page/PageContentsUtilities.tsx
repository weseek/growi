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
import { useSetRemoteLatestPageData } from '~/stores/remote-latest-page';


export const PageContentsUtilities = (): null => {
  const { t } = useTranslation();

  const { data: pageId } = useCurrentPageId();
  const { open: openConflictDiffModal, close: closeConflictDiffModal } = useConflictDiffModal();
  const { setRemoteLatestPageData } = useSetRemoteLatestPageData();

  const updateStateAfterSave = useUpdateStateAfterSave(pageId);

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
      catch (error) {
        //
      }
    };
  }, [closeConflictDiffModal, pageId, t, updateStateAfterSave]);

  const onConflictHandler = useCallback((error: ErrorV3, newMarkdown: string) => {
    const latestRevision = error.args.returnLatestRevision;

    const remoteLatestPageData = {
      remoteRevisionId: latestRevision.revisionId,
      remoteRevisionBody: latestRevision.revisionBody,
      remoteRevisionLastUpdateUser: latestRevision.user,
      remoteRevisionLastUpdatedAt: latestRevision.createdAt,
    };

    setRemoteLatestPageData(remoteLatestPageData);

    const resolveConflictHandler = generateResolveConflictHandler(latestRevision.revisionId);
    if (resolveConflictHandler == null) {
      return;
    }
    openConflictDiffModal(newMarkdown, resolveConflictHandler);

    // TODO: i18n
    toastWarning('コンフリクトが発生しました。差分を確認してください。');
  }, [generateResolveConflictHandler, openConflictDiffModal, setRemoteLatestPageData]);

  useHandsontableModalLauncherForView({
    onSaveSuccess: () => {
      toastSuccess(t('toaster.save_succeeded'));

      updateStateAfterSave?.();
    },
    onSaveError: (errors: Array<ErrorV3>, newMarkdown: string) => {
      for (const error of errors) {
        if (error.code === 'conflict') {
          onConflictHandler(error, newMarkdown);
          return;
        }
      }

      toastError(errors);
    },
  });

  useDrawioModalLauncherForView({
    onSaveSuccess: () => {
      toastSuccess(t('toaster.save_succeeded'));

      updateStateAfterSave?.();
    },
    onSaveError: (error) => {
      toastError(error);
    },
  });

  return null;
};
