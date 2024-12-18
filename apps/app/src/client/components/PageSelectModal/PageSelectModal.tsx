import type { FC } from 'react';
import {
  Suspense, useState, useCallback,
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

import { TreeItemForModal } from './TreeItemForModal';


export const PageSelectModal: FC = () => {
  const {
    data: PageSelectModalData,
    close: closeModal,
  } = usePageSelectModal();

  const isOpened = PageSelectModalData?.isOpened ?? false;

  const [clickedParentPage, setClickedParentPage] = useState<IPageForItem | null>(null);

  const { t } = useTranslation();

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: targetAndAncestorsData } = useTargetAndAncestors();
  const { data: currentPage } = useSWRxCurrentPage();

  const onClickTreeItem = useCallback((page: IPageForItem) => {
    const parentPagePath = page.path;

    if (parentPagePath == null) {
      return;
    }

    setClickedParentPage(page);
  }, []);

  const onClickCancel = useCallback(() => {
    setClickedParentPage(null);
    closeModal();
  }, [closeModal]);

  const onClickDone = useCallback(() => {
    if (clickedParentPage != null) {
      PageSelectModalData?.opts?.onSelected?.(clickedParentPage);
    }

    closeModal();
  }, [PageSelectModalData?.opts, clickedParentPage, closeModal]);

  const parentPagePath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage?.path ?? ''));

  const targetPathOrId = clickedParentPage?.path || parentPagePath;

  const targetPath = clickedParentPage?.path || parentPagePath;

  if (isGuestUser == null) {
    return <></>;
  }

  return (
    <Modal
      isOpen={isOpened}
      toggle={closeModal}
      centered
    >
      <ModalHeader toggle={closeModal}>{t('page_select_modal.select_page_location')}</ModalHeader>
      <ModalBody className="p-0">
        <Suspense fallback={<ItemsTreeContentSkeleton />}>
          <SimpleBar style={{ maxHeight: 'calc(85vh - 133px)' }}> {/* 133px = 63px(ModalHeader) + 70px(ModalFooter) */}
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
          </SimpleBar>
        </Suspense>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClickCancel}>{t('Cancel')}</Button>
        <Button color="primary" onClick={onClickDone}>{t('Done')}</Button>
      </ModalFooter>
    </Modal>
  );
};
