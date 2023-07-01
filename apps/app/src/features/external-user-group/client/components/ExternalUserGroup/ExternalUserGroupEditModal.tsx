import React, {
  FC, useState, useEffect, useCallback,
} from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { IExternalUserGroupHasId } from '~/features/external-user-group/interfaces/external-user-group';

type Props = {
  externalUserGroup?: IExternalUserGroupHasId,
  onClickSubmit?: (userGroupData: Partial<IExternalUserGroupHasId>) => Promise<IExternalUserGroupHasId | void>
  isOpen?: boolean
  onHide?: () => Promise<void> | void
};

export const ExternalUserGroupEditModal: FC<Props> = (props: Props) => {

  const { t } = useTranslation('admin');

  const {
    externalUserGroup, onClickSubmit, isOpen, onHide,
  } = props;

  const [currentDescription, setDescription] = useState('');

  const onChangeDescriptionHandler = useCallback((e) => {
    setDescription(e.target.value);
  }, []);

  const onSubmitHandler = useCallback(async(e) => {
    e.preventDefault(); // no reload

    if (onClickSubmit == null) {
      return;
    }

    await onClickSubmit({
      _id: externalUserGroup?._id,
      description: currentDescription,
    });
  }, [externalUserGroup, currentDescription, onClickSubmit]);

  // componentDidMount
  useEffect(() => {
    if (externalUserGroup != null) {
      setDescription(externalUserGroup.description);
    }
  }, [externalUserGroup]);

  return (
    <Modal className="modal-md" isOpen={isOpen} toggle={onHide}>
      <form onSubmit={onSubmitHandler}>
        <ModalHeader tag="h4" toggle={onHide} className="bg-primary text-light">
          {t('user_group_management.basic_info')}
        </ModalHeader>

        <ModalBody>
          <div className="form-group">
            <label htmlFor="description">
              {t('Description')}
            </label>
            <textarea className="form-control" name="description" value={currentDescription} onChange={onChangeDescriptionHandler} />
            <p className="form-text text-muted">
              <small>
                {t('external_user_group.description_form_detail')}
              </small>
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              {t('Update')}
            </button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};
