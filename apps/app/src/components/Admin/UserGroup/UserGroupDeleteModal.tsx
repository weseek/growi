import React, {
  FC, useCallback, useState, useMemo,
} from 'react';

import type { IUserGroupHasId } from '@growi/core';
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
  userGroups: IUserGroupHasId[],
  deleteUserGroup?: IUserGroupHasId,
  onDelete?: (deleteGroupId: string, actionName: string, transferToUserGroupId: string) => Promise<void> | void,
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
  const [transferToUserGroupId, setTransferToUserGroupId] = useState<string>('');

  /*
   * Function
   */
  const resetStates = useCallback(() => {
    setActionName('');
    setTransferToUserGroupId('');
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
    setTransferToUserGroupId(transferToUserGroupId);
  }, []);

  const handleSubmit = useCallback((e) => {
    if (onDelete == null || deleteUserGroup == null) {
      return;
    }

    e.preventDefault();

    onDelete(
      deleteUserGroup._id,
      actionName,
      transferToUserGroupId,
    );
  }, [onDelete, deleteUserGroup, actionName, transferToUserGroupId]);

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
      return group._id !== deleteUserGroup._id;
    });

    const options = groups.map((group) => {
      return <option key={group._id} value={group._id}>{group.name}</option>;
    });

    const defaultOptionText = groups.length === 0 ? t('admin:user_group_management.delete_modal.no_groups')
      : t('admin:user_group_management.delete_modal.select_group');

    return (
      <select
        name="transferToUserGroupId"
        className={`form-control ${actionName === actionForPages.transfer ? '' : 'd-none'}`}
        value={transferToUserGroupId}
        onChange={handleGroupChange}
      >
        <option value="" disabled>{defaultOptionText}</option>
        {options}
      </select>
    );
  }, [deleteUserGroup, userGroups, t, actionName, transferToUserGroupId, handleGroupChange]);

  const validateForm = useCallback(() => {
    let isValid = true;

    if (actionName === '') {
      isValid = false;
    }
    else if (actionName === actionForPages.transfer) {
      isValid = transferToUserGroupId !== '';
    }

    return isValid;
  }, [actionName, transferToUserGroupId]);

  return (
    <Modal className="modal-md" isOpen={props.isShow} toggle={toggleHandler}>
      <ModalHeader tag="h4" toggle={toggleHandler} className="bg-danger text-light">
        <i className="icon icon-fire"></i> {t('admin:user_group_management.delete_modal.header')}
      </ModalHeader>
      <ModalBody>
        <div>
          <span className="fw-bold">{t('admin:user_group_management.group_name')}</span> : &quot;{props?.deleteUserGroup?.name || ''}&quot;
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
