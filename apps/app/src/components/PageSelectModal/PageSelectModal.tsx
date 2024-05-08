import type { FC } from 'react';
import {
  Suspense, useState, useCallback, memo,
} from 'react';

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
import ItemsTreeContentSkeleton from '../ItemsTree/ItemsTreeContentSkeleton';
import { usePagePathRenameHandler } from '../PageEditor/page-path-rename-utils';
import { StickyStretchableScroller } from '../StickyStretchableScroller';

import { TreeItemForModal } from './TreeItemForModal';

import 'simplebar';
import 'simplebar/dist/simplebar.css';

const TreeForModalWrapper = memo((props: { children: JSX.Element }) => {

  const { children } = props;

  const calcViewHeight = useCallback(() => {
    return window.innerHeight / 2;
  }, []);

  return (
    <div className="grw-page-select-modal-wrapper">
      <div data-simplebar>
        { children }
      </div>
    </div>
  );
});

export const PageSelectModal: FC = () => {
  const {
    data: PageSelectModalData,
    close: closeModal,
  } = usePageSelectModal();

  const isOpened = PageSelectModalData?.isOpened ?? false;

  const [clickedParentPagePath, setClickedParentPagePath] = useState<string | null>(null);

  const { t } = useTranslation();

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: currentPath } = useCurrentPagePath();
  const { data: targetId } = useCurrentPageId();
  const { data: targetAndAncestorsData } = useTargetAndAncestors();
  const { data: currentPage } = useSWRxCurrentPage();

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const onClickTreeItem = useCallback((page: IPageForItem) => {
    const parentPagePath = page.path;

    if (parentPagePath == null) {
      return;
    }

    setClickedParentPagePath(parentPagePath);
  }, []);

  const onClickCancel = useCallback(() => {
    setClickedParentPagePath(null);
    closeModal();
  }, [closeModal]);

  const onClickDone = useCallback(() => {
    if (clickedParentPagePath != null) {
      const currentPageTitle = nodePath.basename(currentPage?.path ?? '') || '/';
      const newPagePath = nodePath.resolve(clickedParentPagePath, currentPageTitle);

      pagePathRenameHandler(newPagePath);
    }

    closeModal();
  }, [clickedParentPagePath, closeModal, currentPage?.path, pagePathRenameHandler]);

  const targetPathOrId = targetId || currentPath;

  const path = currentPath || '/';

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
      <ModalBody className="p-0">
        <Suspense fallback={<ItemsTreeContentSkeleton />}>
          <TreeForModalWrapper>
            <div className="p-3">
              <ItemsTree
                CustomTreeItem={TreeItemForModal}
                isEnableActions={!isGuestUser}
                isReadOnlyUser={!!isReadOnlyUser}
                targetPath={path}
                targetPathOrId={targetPathOrId}
                targetAndAncestorsData={targetAndAncestorsData}
                onClickTreeItem={onClickTreeItem}
              />
            </div>
          </TreeForModalWrapper>
        </Suspense>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClickCancel}>{t('Cancel')}</Button>
        <Button color="primary" onClick={onClickDone}>{t('Done')}</Button>
      </ModalFooter>
    </Modal>
  );
};
