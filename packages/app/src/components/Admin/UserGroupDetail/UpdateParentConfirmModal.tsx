import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { useUpdateUserGroupConfirmModal } from '~/stores/modal';


const UpdateParentConfirmModal: FC = () => {
  const { t } = useTranslation();

  const [isForceUpdate, setForceUpdate] = useState(false);

  const { data: modalStatus, close: closeModal } = useUpdateUserGroupConfirmModal();

  if (modalStatus == null) {
    closeModal();
    return <></>;
  }

  const {
    isOpened, targetGroup, updateData, onConfirm,
  } = modalStatus;

  const canRenderCorrectly = targetGroup != null && updateData?.parent !== undefined;

  return (
    <Modal className="modal-md" isOpen={isOpened} toggle={closeModal}>
      <ModalHeader tag="h4" toggle={closeModal} className="bg-warning text-light">
        <i className="icon icon-warning"></i> {t('admin:user_group_management.update_parent_confirm_modal.header')}
      </ModalHeader>
      {
        canRenderCorrectly ? (
          <>
            <ModalBody>
              <div>
                <span className="font-weight-bold">{t('admin:user_group_management.group_name')}</span> : &quot;{targetGroup.name}&quot;
                <hr />
                {updateData != null ? `It will change the parent of "${targetGroup.name}".` : `It will reset the parent of "${targetGroup.name}".`}
              </div>
              <div className="text-danger mt-5">
                <i className="icon-exclamation"></i>
                {t('admin:user_group_management.update_parent_confirm_modal.desc')}(It will affect all pages related to the group.)
              </div>

              <div className="custom-control custom-checkbox custom-checkbox-primary">
                <input
                  className="custom-control-input"
                  name="forceUpdateParents"
                  id="forceUpdateParents"
                  type="checkbox"
                  checked={isForceUpdate}
                  onChange={() => setForceUpdate(!isForceUpdate)}
                />
                <label className="custom-control-label" htmlFor="forceUpdateParents">
                  { t('forceUpdateParents') }
                  <p className="form-text text-muted mt-0">{ t('forceUpdateParentsDescription') }</p>
                </label>
              </div>
            </ModalBody>
            <ModalFooter>
              <button type="submit" onClick={() => onConfirm?.(targetGroup, updateData, isForceUpdate)} className="btn btn-sm btn-warning">
                {t('Confirm')}
              </button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalBody>
              <div>
                <span className="text-error">Something went wrong. Please try again.</span>
              </div>
            </ModalBody>
            <ModalFooter>
              <button type="button" onClick={() => closeModal()} className="btn btn-sm btn-secondary">
                {t('Cancel')}
              </button>
            </ModalFooter>
          </>
        )
      }
    </Modal>
  );
};

export default UpdateParentConfirmModal;
