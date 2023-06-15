import { useTranslation } from 'next-i18next';

import { useUpdateStateAfterSave } from '~/client/services/page-operation';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useCurrentPageId } from '~/stores/page';
import { useModalLauncherForView } from '~/client/services/side-effects/modal-launcher-for-view';
import { SaveByModalType } from '~/interfaces/page-operation';

export const PageContentsUtilities = (): null => {
  const { t } = useTranslation();

  const { data: pageId } = useCurrentPageId();
  const updateStateAfterSave = useUpdateStateAfterSave(pageId);

  const modalTypes: SaveByModalType[] = Object.values(SaveByModalType);

  // Iterate over each modalType and call useModalLauncherForView for every modal type
  modalTypes.map((modalType) => {
    useModalLauncherForView(modalType, {
      onSaveSuccess() {
        toastSuccess(t('toaster.save_succeeded'));

        updateStateAfterSave?.();
      },
      onSaveError: (error) => {
        toastError(error);
      },
    })
  });

  return null;
};
