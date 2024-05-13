import type { FC } from 'react';
import { Suspense, useState, useCallback } from 'react';

import nodePath from 'path';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button,
} from 'reactstrap';

import type { IPageForItem } from '~/interfaces/page';
import { useTargetAndAncestors, useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';
import { usePageSelectModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';
import { useSWRxPageChildren } from '~/stores/page-listing';

import { ItemsTree } from '../ItemsTree';
import ItemsTreeContentSkeleton from '../ItemsTree/ItemsTreeContentSkeleton';
import { usePagePathRenameHandler } from '../PageEditor/page-path-rename-utils';

import { TreeItemForModal } from './TreeItemForModal';

export const PageSelectModal: FC = () => {
  const {
    data: PageSelectModalData,
    close: closeModal,
  } = usePageSelectModal();

  const isOpened = PageSelectModalData?.isOpened ?? false;

  const [clickedParentPagePath, setClickedParentPagePath] = useState<string | null>(null);
  const [clickedParentPageId, setClickedParentPageId] = useState<string | null>(null);

  const { t } = useTranslation();

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: targetAndAncestorsData } = useTargetAndAncestors();
  const { data: currentPage } = useSWRxCurrentPage();
  const { mutate: mutateChildren } = useSWRxPageChildren(clickedParentPageId);

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const onClickTreeItem = useCallback((page: IPageForItem) => {
    const parentPagePath = page.path;
    const parentPageId = page._id;

    if (parentPagePath == null || parentPageId == null) {
      return;
    }

    setClickedParentPagePath(parentPagePath);
    setClickedParentPageId(parentPageId);
  }, []);

  const onClickCancel = useCallback(() => {
    setClickedParentPagePath(null);
    closeModal();
  }, [closeModal]);

  const onClickDone = useCallback(async() => {
    if (clickedParentPagePath != null) {
      const currentPageTitle = nodePath.basename(currentPage?.path ?? '') || '/';
      const newPagePath = nodePath.resolve(clickedParentPagePath, currentPageTitle);

      pagePathRenameHandler(newPagePath);
      await mutateChildren();
    }

    closeModal();
  }, [clickedParentPagePath, closeModal, currentPage?.path, mutateChildren, pagePathRenameHandler]);

  const targetPathOrId = clickedParentPagePath;

  const targetPath = clickedParentPagePath || '/';

  if (isGuestUser == null) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpened}
      toggle={closeModal}
      centered
      size="sm"
    >
      <ModalHeader toggle={closeModal}>{t('page_select_modal.select_page_location')}</ModalHeader>
      <ModalBody>
        <Suspense fallback={<ItemsTreeContentSkeleton />}>
          <ItemsTree
            CustomTreeItem={TreeItemForModal}
            isEnableActions={!isGuestUser}
            isReadOnlyUser={!!isReadOnlyUser}
            targetPath={targetPath}
            targetPathOrId={targetPathOrId}
            targetAndAncestorsData={targetAndAncestorsData}
            onClickTreeItem={onClickTreeItem}
          />
        </Suspense>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClickCancel}>{t('Cancel')}</Button>
        <Button color="primary" onClick={onClickDone}>{t('Done')}</Button>
      </ModalFooter>
    </Modal>
  );
};
