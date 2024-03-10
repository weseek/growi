import { useCallback } from 'react';

import { Origin } from '@growi/core';
import type { ErrorV3 } from '@growi/core/dist/models';
import { useTranslation } from 'next-i18next';

import { updatePage, useUpdateStateAfterSave } from '~/client/services/page-operation';
import { useDrawioModalLauncherForView } from '~/client/services/side-effects/drawio-modal-launcher-for-view';
import { useHandsontableModalLauncherForView } from '~/client/services/side-effects/handsontable-modal-launcher-for-view';
import { extractConflictDataFromErrorObj } from '~/client/util/conflict-utils';
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

  // eslint-disable-next-line max-len
  const generateResolveConflictHandler = useCallback((latestRevisionId: string, onConflict?: (conflictInfo: RemoteRevisionData, newMarkdown: string) => void) => {
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
      const conflictData = extractConflictDataFromErrorObj(errors);

      if (conflictData != null) {
        onConflictHandler(conflictData, newMarkdown);
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
      const conflictData = extractConflictDataFromErrorObj(errors);

      if (conflictData != null) {
        onConflictHandler(conflictData, newMarkdown);
        return;
      }

      toastError(errors);
    },
  });

  return null;
};
