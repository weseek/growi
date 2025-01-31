import React, { useCallback } from 'react';

import { GroupType } from '@growi/core';
import { useTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';

import type { PopulatedGrantedGroup } from '~/interfaces/page-grant';
import { useSWRxUserRelatedGroups } from '~/stores/user';

type Props = {
  isOpen: boolean,
  closeModal: () => void,
  selectedUserGroup: PopulatedGrantedGroup[],
  onSelect: (userGroup: PopulatedGrantedGroup) => void,
}

const SelectUserGroupModalSubstance: React.FC<Props> = (props: Props) => {
  const { selectedUserGroup, onSelect, closeModal } = props;

  const { t } = useTranslation();
  const { data: userRelatedGroups } = useSWRxUserRelatedGroups();

  const checked = useCallback((targetUserGroup: PopulatedGrantedGroup) => {
    const selectedUserGroupIds = selectedUserGroup.map(userGroup => userGroup.item._id);
    return selectedUserGroupIds.includes(targetUserGroup.item._id);
  }, [selectedUserGroup]);

  return (
    <ModalBody className="d-flex flex-column">
      {userRelatedGroups != null && userRelatedGroups.relatedGroups.map(userGroup => (
        <button
          className="btn btn-outline-primary d-flex justify-content-start mb-3 mx-4 align-items-center p-3"
          type="button"
          key={userGroup.item.id}
          onClick={() => onSelect(userGroup)}
        >
          <input type="checkbox" checked={checked(userGroup)} />
          <p className="ms-3 mb-0">{userGroup.item.name}</p>
          {userGroup.type === GroupType.externalUserGroup && <span className="ms-2 badge badge-pill badge-info">{userGroup.item.provider}</span>}
          {/* TODO: Replace <div className="small">(TBD) List group members</div> */}
        </button>
      ))}
      <button
        type="button"
        className="btn btn-primary mt-2 mx-auto"
        onClick={closeModal}
      >
        {t('Done')}
      </button>

    </ModalBody>
  );
};

export const SelectUserGroupModal: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const { isOpen, closeModal } = props;

  return (
    <Modal isOpen={isOpen} toggle={closeModal}>
      <ModalHeader toggle={closeModal}>
        {t('user_group.select_group')}
      </ModalHeader>
      <SelectUserGroupModalSubstance {...props} />
    </Modal>
  );
};
