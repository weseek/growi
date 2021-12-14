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

  const { data: migrationStatus } = useSWRxV5MigrationStatus();

  // for delete modal
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pagesToDelete, setPagesToDelete] = useState<IPageForPageDeleteModal[]>([]);

  if (!migrationStatus?.isV5Compatible) {
    // TODO : improve design
    // Story : https://redmine.weseek.co.jp/issues/83755
    return (
      <>
        <div className="grw-sidebar-content-header p-3">
          <h3 className="mb-0">{t('Page Tree')}</h3>
        </div>
        <div className="mt-5 mx-2 text-center">
          <h3 className="text-gray">{t('admin:v5_page_migration.page_tree_not_avaliable')}</h3>
          <a href="/admin">{t('admin:v5_page_migration.go_to_settings')}</a>
        </div>
      </>
    );
  }
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

      <div className="grw-sidebar-content-footer">
        {
          !isGuestUser && migrationStatus?.migratablePagesCount != null && migrationStatus.migratablePagesCount !== 0 && (
            <PrivateLegacyPages />
          )
        }
      </div>
    </>
  );
});

export default PageTree;
