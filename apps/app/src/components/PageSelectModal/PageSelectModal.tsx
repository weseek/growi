import type { FC } from 'react';
import { useState } from 'react';

import nodePath from 'path';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button,
} from 'reactstrap';

import type { IPageForItem } from '~/interfaces/page';
import { useTargetAndAncestors, useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';
import { usePageSelectModal } from '~/stores/modal';
import { useCurrentPagePath, useCurrentPageId, useSWRxCurrentPage } from '~/stores/page';

import { ItemsTree } from '../ItemsTree';
import { usePagePathRenameHandler } from '../PageEditor/page-path-rename-utils';

import { TreeItemForModal } from './TreeItemForModal';


export const PageSelectModal: FC = () => {
  const {
    data: PageSelectModalData,
    close: closeModal,
  } = usePageSelectModal();

  const isOpened = PageSelectModalData?.isOpened ?? false;

  const [clickedParentPagePath, setClickedParentPagePath] = useState('');

  const { t } = useTranslation();

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: currentPath } = useCurrentPagePath();
  const { data: targetId } = useCurrentPageId();
  const { data: targetAndAncestorsData } = useTargetAndAncestors();
  const { data: currentPage } = useSWRxCurrentPage();

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const targetPathOrId = targetId || currentPath;

  if (isGuestUser == null) {
    return null;
  }

  const path = currentPath || '/';

  const onClickTreeItem = (page: IPageForItem) => {
    const parentPagePath = page.path;

    if (parentPagePath == null) {
      return;
    }

    setClickedParentPagePath(parentPagePath);
  };

  const onClickCancel = () => {
    setClickedParentPagePath('');
    closeModal();
  };

  const onClickDone = () => {
    const currentPageTitle = nodePath.basename(currentPage?.path ?? '') || '/';
    const newPagePath = nodePath.resolve(clickedParentPagePath, currentPageTitle);

    pagePathRenameHandler(newPagePath);

    closeModal();
  };

  return (
    <Modal
      isOpen={isOpened}
      toggle={closeModal}
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
          onClickTreeItem={onClickTreeItem}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClickCancel}>{t('Cancel')}</Button>{' '}
        <Button color="primary" onClick={onClickDone}>{t('Done')}</Button>{' '}
      </ModalFooter>
    </Modal>
  );
};
