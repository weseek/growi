import React from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button,
} from 'reactstrap';

import { useTargetAndAncestors, useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';
import { useParentPageSelectModal } from '~/stores/modal';
import { useCurrentPagePath, useCurrentPageId } from '~/stores/page';

import ItemsTree from './Sidebar/PageTree/ItemsTree';

export const ParentPageSelectModal = (): JSX.Element => {
  const {
    data: parentPageSelectModalData,
    close: closeModal,
  } = useParentPageSelectModal();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: currentPath } = useCurrentPagePath();
  const { data: targetId } = useCurrentPageId();
  const { data: targetAndAncestorsData } = useTargetAndAncestors();

  const isOpened = parentPageSelectModalData?.isOpened ?? false;

  if (!isOpened) {
    return <></>;
  }

  const targetPathOrId = targetId || currentPath;
  const path = currentPath || '/';

  return (
    <>
      <Modal
        isOpen={isOpened}
        toggle={() => closeModal()}
        centered={true}
      >
        <ModalHeader toggle={() => closeModal()}>モーダル</ModalHeader>
        <ModalBody >
        ` <ItemsTree
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
    </>
  );
};
