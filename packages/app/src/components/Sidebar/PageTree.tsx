import React, { FC, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSWRxV5MigrationStatus } from '~/stores/page-listing';
import {
  useCurrentPagePath, useCurrentPageId, useTargetAndAncestors, useIsGuestUser,
} from '~/stores/context';

import ItemsTree from './PageTree/ItemsTree';
import PrivateLegacyPages from './PageTree/PrivateLegacyPages';
import { IPageForPageDeleteModal } from '../PageDeleteModal';


const PageTree: FC = memo(() => {
  const { t } = useTranslation();

  const { data: isGuestUser } = useIsGuestUser();
  const { data: currentPath } = useCurrentPagePath();
  const { data: targetId } = useCurrentPageId();
  const { data: targetAndAncestorsData } = useTargetAndAncestors();

  const { data: migrationStatus } = useSWRxV5MigrationStatus(!isGuestUser);

  // for delete modal
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pagesToDelete, setPagesToDelete] = useState<IPageForPageDeleteModal[]>([]);

  /*
   * dependencies
   */
  if (isGuestUser == null) {
    return null;
  }

  const onClickDeleteByPage = (page: IPageForPageDeleteModal) => {
    setDeleteModalOpen(true);
    setPagesToDelete([page]);
  };

  const onCloseDelete = () => {
    setDeleteModalOpen(false);
  };

  const path = currentPath || '/';

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Page Tree')}</h3>
      </div>

      <div className="grw-sidebar-content-body">
        <ItemsTree
          isEnableActions={!isGuestUser}
          targetPath={path}
          targetId={targetId}
          targetAndAncestorsData={targetAndAncestorsData}
          isDeleteModalOpen={isDeleteModalOpen}
          pagesToDelete={pagesToDelete}
          isAbleToDeleteCompletely={false} // TODO: pass isAbleToDeleteCompletely
          isDeleteCompletelyModal={false} // TODO: pass isDeleteCompletelyModal
          onCloseDelete={onCloseDelete}
          onClickDeleteByPage={onClickDeleteByPage}
        />
      </div>

      {!isGuestUser && migrationStatus?.migratablePagesCount != null && migrationStatus.migratablePagesCount !== 0 && (
        <div className="grw-pagetree-footer border-top p-3 w-100">
          <PrivateLegacyPages />
        </div>
      )}
    </>
  );
});

export default PageTree;
