import React from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button,
} from 'reactstrap';

import { useTargetAndAncestors, useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';
import { usePageSelectModal } from '~/stores/modal';
import { useCurrentPagePath, useCurrentPageId } from '~/stores/page';

import { ItemsTree } from '../ItemsTree';

import { TreeItemForModal } from './TreeItemForModal';


export const PageSelectModal = () => {
  const {
    data: PageSelectModalData,
    close: closeModal,
  } = usePageSelectModal();

  const isOpened = PageSelectModalData?.isOpened ?? false;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: currentPath } = useCurrentPagePath();
  const { data: targetId } = useCurrentPageId();
  const { data: targetAndAncestorsData } = useTargetAndAncestors();

  const targetPathOrId = targetId || currentPath;

  if (isGuestUser == null) {
    return null;
  }

  const path = currentPath || '/';

  return (
    <Modal
      isOpen={isOpened}
      toggle={() => closeModal()}
      centered
    >
      <ModalHeader toggle={() => closeModal()}>modal</ModalHeader>
      <ModalBody>
        <ItemsTree
          CustomTreeItem={TreeItemForModal}
          isEnableActions={!isGuestUser}
          isReadOnlyUser={!!isReadOnlyUser}
          targetPath={path}
          targetPathOrId={targetPathOrId}
          targetAndAncestorsData={targetAndAncestorsData}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="primary">
          Do Something
        </Button>{' '}
        <Button color="secondary">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
