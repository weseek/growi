import type { ErrorV3 } from '@growi/core/dist/models';
import { useTranslation } from 'next-i18next';

import { useUpdateStateAfterSave } from '~/client/services/page-operation';
import { useDrawioModalLauncherForView } from '~/client/services/side-effects/drawio-modal-launcher-for-view';
import { useHandsontableModalLauncherForView } from '~/client/services/side-effects/handsontable-modal-launcher-for-view';
import { extractConflictDataFromErrorObj, useOnConflictHandlerForView } from '~/client/services/use-conflict';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useCurrentPageId } from '~/stores/page';

export const PageContentsUtilities = (): null => {
  const { t } = useTranslation();

  const { data: pageId } = useCurrentPageId();

  const updateStateAfterSave = useUpdateStateAfterSave(pageId);

  const onConflictHandler = useOnConflictHandlerForView();

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
