import React, { FC } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button,
} from 'reactstrap';

import { useTargetAndAncestors, useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';
import { usePageSelectModal } from '~/stores/modal';
import { useCurrentPagePath, useCurrentPageId } from '~/stores/page';

import { ItemsTree } from '../ItemsTree';

import { TreeItemForModal } from './TreeItemForModal';


export const PageSelectModal: FC = () => {
  const {
    data: PageSelectModalData,
    close: closeModal,
  } = usePageSelectModal();

  const isOpened = PageSelectModalData?.isOpened ?? false;

  const { t } = useTranslation();

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
      size="sm"
    >
      <ModalHeader toggle={closeModal}>{t('page_select_modal.select_page_location')}</ModalHeader>
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
        <Button color="primary" onClick={closeModal}>{t('Done')}</Button>{' '}
      </ModalFooter>
    </Modal>
  );
};
