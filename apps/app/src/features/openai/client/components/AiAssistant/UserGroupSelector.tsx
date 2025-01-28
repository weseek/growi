import React from 'react';

import { useTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';

import { useSWRxUserRelatedGroups } from '~/stores/user';

type Props = {
  isOpen: boolean,
  closeModal: () => void,
}

const UserGroupSelectorSubstance: React.FC<Props> = () => {
  const { data: userRelatedGroups } = useSWRxUserRelatedGroups();

  return (
    <ModalBody>body</ModalBody>
  );
};

export const UserGroupSelector: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const { isOpen, closeModal } = props;

  return (
    <Modal isOpen={isOpen} toggle={closeModal}>
      <ModalHeader toggle={closeModal}>
        {t('user_group.select_group')}
      </ModalHeader>
      <UserGroupSelectorSubstance {...props} />
    </Modal>
  );
};
