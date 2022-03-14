import React, {
  FC, useState, useEffect, useCallback,
} from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';

import { Ref } from '~/interfaces/common';
import { IUserGroup, IUserGroupHasId } from '~/interfaces/user';
import { CustomWindow } from '~/interfaces/global';
import Xss from '~/services/xss';

type Props = {
  userGroup?: IUserGroupHasId,
  onClickButton?: (userGroupData: Partial<IUserGroupHasId>) => Promise<IUserGroupHasId | void>
  isShow?: boolean
  onHide?: () => Promise<void> | void
};

const UserGroupModal: FC<Props> = (props: Props) => {
  const xss: Xss = (window as CustomWindow).xss;

  const { t } = useTranslation();

  const {
    userGroup, onClickButton, isShow, onHide,
  } = props;

  /*
   * State
   */
  const [currentName, setName] = useState('');
  const [currentDescription, setDescription] = useState('');
  const [currentParent, setParent] = useState<Ref<IUserGroup> | null>(null);

  /*
   * Function
   */
  const onChangeNameHandler = useCallback((e) => {
    setName(e.target.value);
  }, []);

  const onChangeDescriptionHandler = useCallback((e) => {
    setDescription(e.target.value);
  }, []);

  const onClickButtonHandler = useCallback(async(e) => {
    e.preventDefault(); // no reload

    if (onClickButton == null) {
      return;
    }

    await onClickButton({
      _id: userGroup?._id,
      name: currentName,
      description: currentDescription,
      parent: currentParent,
    });
  }, [userGroup, currentName, currentDescription, currentParent, onClickButton]);

  // componentDidMount
  useEffect(() => {
    if (userGroup != null) {
      setName(userGroup.name);
      setDescription(userGroup.description);
      setParent(userGroup.parent);
    }
  }, [userGroup]);

  return (
    <Modal className="modal-md" isOpen={isShow} toggle={onHide}>
      <ModalHeader tag="h4" toggle={onHide} className="bg-primary text-light">
        {t('admin:user_group_management.basic_info')}
      </ModalHeader>

      <ModalBody>
        <div className="form-group">
          <label htmlFor="name">
            {t('admin:user_group_management.group_name')}
          </label>
          <input
            className="form-control"
            type="text"
            name="name"
            placeholder={t('admin:user_group_management.group_example')}
            value={currentName}
            onChange={onChangeNameHandler}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            {t('Description')}
          </label>
          <textarea className="form-control" name="description" value={currentDescription} onChange={onChangeDescriptionHandler} />
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="form-group">
          <button type="button" className="btn btn-primary" onClick={onClickButtonHandler}>
            {t('Create')}
          </button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default UserGroupModal;
