import React, {
  FC, useState, useEffect, useCallback,
} from 'react';

import { Ref } from '@growi/core';
import { useTranslation } from 'next-i18next';
import Modal from 'reactstrap/es/Modal';
import ModalBody from 'reactstrap/es/ModalBody';
import ModalFooter from 'reactstrap/es/ModalFooter';
import ModalHeader from 'reactstrap/es/ModalHeader';

import { IUserGroup, IUserGroupHasId } from '~/interfaces/user';

type Props = {
  userGroup?: IUserGroupHasId,
  buttonLabel?: string,
  onClickSubmit?: (userGroupData: Partial<IUserGroupHasId>) => Promise<IUserGroupHasId | void>
  isShow?: boolean
  onHide?: () => Promise<void> | void
};

export const UserGroupModal: FC<Props> = (props: Props) => {

  const { t } = useTranslation('admin');

  const {
    userGroup, buttonLabel, onClickSubmit, isShow, onHide,
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

  const onSubmitHandler = useCallback(async(e) => {
    e.preventDefault(); // no reload

    if (onClickSubmit == null) {
      return;
    }

    await onClickSubmit({
      _id: userGroup?._id,
      name: currentName,
      description: currentDescription,
      parent: currentParent,
    });
  }, [userGroup, currentName, currentDescription, currentParent, onClickSubmit]);

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
      <form onSubmit={onSubmitHandler}>
        <ModalHeader tag="h4" toggle={onHide} className="bg-primary text-light">
          {t('user_group_management.basic_info')}
        </ModalHeader>

        <ModalBody>
          <div className="form-group">
            <label htmlFor="name">
              {t('user_group_management.group_name')}
            </label>
            <input
              className="form-control"
              type="text"
              name="name"
              placeholder={t('user_group_management.group_example')}
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

          {/* TODO 90732: Add a drop-down to show selectable parents */}

          {/* TODO 85462: Add a note that "if you change the parent, the offspring will also be moved together */}

        </ModalBody>

        <ModalFooter>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              {buttonLabel}
            </button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};
