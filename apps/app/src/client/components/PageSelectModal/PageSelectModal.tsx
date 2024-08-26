import type { FC } from 'react';
import {
  Suspense, useState, useCallback,
  memo,
} from 'react';

import nodePath from 'path';

import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button,
} from 'reactstrap';
import SimpleBar from 'simplebar-react';

import type { IPageForItem } from '~/interfaces/page';
import { useTargetAndAncestors, useIsGuestUser, useIsReadOnlyUser } from '~/stores-universal/context';
import { usePageSelectModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';

import { ItemsTree } from '../ItemsTree';
import ItemsTreeContentSkeleton from '../ItemsTree/ItemsTreeContentSkeleton';
import { usePagePathRenameHandler } from '../PageEditor/page-path-rename-utils';

import { TreeItemForModal } from './TreeItemForModal';

import 'simplebar-react/dist/simplebar.min.css';

const TreeForModalWrapper = memo((props: { children: JSX.Element }) => {

  const { children } = props;
  return (
    <div className="grw-page-select-modal-wrapper">
      <SimpleBar style={{ maxHeight: 350 }}>
        { children }
      </SimpleBar>
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
  const { data: targetAndAncestorsData } = useTargetAndAncestors();
  const { data: currentPage } = useSWRxCurrentPage();

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const onClickTreeItem = useCallback((page: IPageForItem) => {
    const parentPagePath = page.path;

    if (parentPagePath == null) {
      return <></>;
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

  const parentPagePath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage?.path ?? ''));

  const targetPathOrId = clickedParentPagePath || parentPagePath;

  const targetPath = clickedParentPagePath || parentPagePath;

  if (isGuestUser == null) {
    return <></>;
  }

  return (
    <Modal
      isOpen={isOpened}
      toggle={closeModal}
      centered
      size="lg"
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
                targetPath={targetPath}
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
