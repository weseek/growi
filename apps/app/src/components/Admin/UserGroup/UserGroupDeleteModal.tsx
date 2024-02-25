import type { FC } from 'react';
import React, { useCallback, useState, useMemo } from 'react';

import {
  getIdForRef, isPopulated, type IGrantedGroup, type IUserGroupHasId,
} from '@growi/core';
import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';


/**
 * Delete User Group Select component
 *
 * @export
 * @class GrantSelector
 * @extends {React.Component}
 */
type Props = {
  userGroups: IGrantedGroup[],
  deleteUserGroup?: IUserGroupHasId,
  onDelete?: (deleteGroupId: string, actionName: string, transferToUserGroup: IGrantedGroup | null) => Promise<void> | void,
  isShow: boolean,
  onHide?: () => Promise<void> | void,
};

type AvailableOption = {
  id: number,
  actionForPages: string,
  iconClass: string,
  styleClass: string,
  label: string,
};

// actionName master constants
const actionForPages = {
  public: 'public',
  delete: 'delete',
  transfer: 'transfer',
};

export const UserGroupDeleteModal: FC<Props> = (props: Props) => {

  const { t } = useTranslation();

  const {
    onHide, onDelete, userGroups, deleteUserGroup,
  } = props;

  const availableOptions = useMemo<AvailableOption[]>(() => {
    return [
      {
        id: 1,
        actionForPages: actionForPages.public,
        iconClass: 'icon-people',
        styleClass: '',
        label: t('admin:user_group_management.delete_modal.publish_pages'),
      },
      {
        id: 2,
        actionForPages: actionForPages.delete,
        iconClass: 'icon-trash',
        styleClass: 'text-danger',
        label: t('admin:user_group_management.delete_modal.delete_pages'),
      },
      {
        id: 3,
        actionForPages: actionForPages.transfer,
        iconClass: 'icon-options',
        styleClass: '',
        label: t('admin:user_group_management.delete_modal.transfer_pages'),
      },
    ];
  }, [t]);

  /*
   * State
   */
  const [actionName, setActionName] = useState<string>('');
  const [transferToUserGroup, setTransferToUserGroup] = useState<IGrantedGroup | null>(null);

  /*
   * Function
   */
  const resetStates = useCallback(() => {
    setActionName('');
    setTransferToUserGroup(null);
  }, []);

  const toggleHandler = useCallback(() => {
    if (onHide == null) {
      return;
    }

    resetStates();
    onHide();
  }, [onHide, resetStates]);

  const handleActionChange = useCallback((e) => {
    const actionName = e.target.value;
    setActionName(actionName);
  }, [setActionName]);

  const handleGroupChange = useCallback((e) => {
    const transferToUserGroupId = e.target.value;
    const selectedGroup = userGroups.find(group => getIdForRef(group.item) === transferToUserGroupId) ?? null;
    setTransferToUserGroup(selectedGroup);
  }, [userGroups]);

  const handleSubmit = useCallback((e) => {
    if (onDelete == null || deleteUserGroup == null) {
      return;
    }

    e.preventDefault();

    onDelete(
      deleteUserGroup._id,
      actionName,
      transferToUserGroup,
    );
  }, [onDelete, deleteUserGroup, actionName, transferToUserGroup]);

  const renderPageActionSelector = useCallback(() => {
    const options = availableOptions.map((opt) => {
      return <option key={opt.id} value={opt.actionForPages}>{opt.label}</option>;
    });

    return (
      <select
        name="actionName"
        className="form-control"
        placeholder="select"
        value={actionName}
        onChange={handleActionChange}
      >
        <option value="" disabled>{t('admin:user_group_management.delete_modal.dropdown_desc')}</option>
        {options}
      </select>
    );
  }, [availableOptions, actionName, handleActionChange, t]);

  const renderGroupSelector = useCallback(() => {
    if (deleteUserGroup == null) {
      return;
    }

    const groups = userGroups.filter((group) => {
      return getIdForRef(group.item) !== deleteUserGroup._id;
    });

    const options = groups.map((group) => {
      const groupId = getIdForRef(group.item);
      const groupName = isPopulated(group.item) ? group.item.name : null;
      return { id: groupId, name: groupName };
    }).filter(obj => obj.name != null)
      .map(obj => <option key={obj.id} value={obj.id}>{obj.name}</option>);

    const defaultOptionText = groups.length === 0 ? t('admin:user_group_management.delete_modal.no_groups')
      : t('admin:user_group_management.delete_modal.select_group');

    return (
      <select
        name="transferToUserGroup"
        className={`form-control ${actionName === actionForPages.transfer ? '' : 'd-none'}`}
        value={transferToUserGroup != null ? getIdForRef(transferToUserGroup.item) : undefined}
        onChange={handleGroupChange}
      >
        <option value="" disabled>{defaultOptionText}</option>
        {options}
      </select>
    );
  }, [deleteUserGroup, userGroups, t, actionName, transferToUserGroup, handleGroupChange]);

  const validateForm = useCallback(() => {
    let isValid = true;

    if (actionName === '') {
      isValid = false;
    }
    else if (actionName === actionForPages.transfer) {
      isValid = transferToUserGroup != null;
    }

    return isValid;
  }, [actionName, transferToUserGroup]);

  return (
    <Modal className="modal-md" isOpen={props.isShow} toggle={toggleHandler}>
      <ModalHeader tag="h4" toggle={toggleHandler} className="bg-danger text-light">
        <i className="icon icon-fire"></i> {t('admin:user_group_management.delete_modal.header')}
      </ModalHeader>
      <ModalBody>
        <div>
          <span className="font-weight-bold">{t('admin:user_group_management.group_name')}</span> : &quot;{props?.deleteUserGroup?.name || ''}&quot;
        </div>
        <div className="text-danger mt-3">
          {t('admin:user_group_management.delete_modal.desc')}
        </div>
      </ModalBody>
      <ModalFooter>
        <form className="d-flex justify-content-between w-100" onSubmit={handleSubmit}>
          <div className="d-flex form-group mb-0">
            {renderPageActionSelector()}
            {renderGroupSelector()}
          </div>
          <button type="submit" value="" className="btn btn-sm btn-danger text-nowrap" disabled={!validateForm()}>
            <i className="icon icon-fire"></i> {t('Delete')}
          </button>
        </form>
      </ModalFooter>
    </Modal>
  );
};
