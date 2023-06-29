import { FC } from 'react';

import { useTranslation } from 'next-i18next';

import { useUpdateStateAfterSave } from '~/client/services/page-operation';
import { useModalLauncherForView } from '~/client/services/side-effects/modal-launcher-for-view';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { SaveByModalType } from '~/interfaces/page-operation';
import { useCurrentPageId } from '~/stores/page';

const ModalLauncherUtility: FC<{ modalType: SaveByModalType }> = ({ modalType }) => {
  const { t } = useTranslation();
  const { data: pageId } = useCurrentPageId();
  const updateStateAfterSave = useUpdateStateAfterSave(pageId);

  useModalLauncherForView(modalType, {
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

export const PageContentsUtilities: FC = () => {
  const modalTypes: SaveByModalType[] = Object.values(SaveByModalType);

  return (
    <>
      {modalTypes.map(modalType => (
        <ModalLauncherUtility key={modalType} modalType={modalType} />
      ))}
    </>
  );
};
