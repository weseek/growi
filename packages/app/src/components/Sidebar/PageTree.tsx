import React, { FC, memo } from 'react';

import { useTranslation } from 'next-i18next';

import {
  useCurrentPagePath, useCurrentPageId, useTargetAndAncestors, useIsGuestUser,
} from '~/stores/context';
import { useSWRxV5MigrationStatus } from '~/stores/page-listing';

import ItemsTree from './PageTree/ItemsTree';
import { PrivateLegacyPagesLink } from './PageTree/PrivateLegacyPagesLink';

const PageTree: FC = memo(() => {
  const { t } = useTranslation();

  const { data: isGuestUser } = useIsGuestUser();
  const { data: currentPath } = useCurrentPagePath();
  const { data: targetId } = useCurrentPageId();
  const { data: targetAndAncestorsData } = useTargetAndAncestors();
  const { data: migrationStatus } = useSWRxV5MigrationStatus();

  const targetPathOrId = targetId || currentPath;

  if (migrationStatus == null) {
    return (
      <>
        <div className="grw-sidebar-content-header p-3">
          <h3 className="mb-0">{t('Page Tree')}</h3>
        </div>
        <div className="text-muted text-center mt-3">
          <i className="fa fa-lg fa-spinner fa-pulse mr-1"></i>
        </div>
      </>
    );
  }

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

  const path = currentPath || '/';

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Page Tree')}</h3>
      </div>

      <ItemsTree
        isEnableActions={!isGuestUser}
        targetPath={path}
        targetPathOrId={targetPathOrId}
        targetAndAncestorsData={targetAndAncestorsData}
      />

      {!isGuestUser && migrationStatus?.migratablePagesCount != null && migrationStatus.migratablePagesCount !== 0 && (
        <div className="grw-pagetree-footer border-top p-3 w-100">
          <div className="private-legacy-pages-link px-3 py-2">
            <PrivateLegacyPagesLink />
          </div>
        </div>
      )}
    </>
  );
});

PageTree.displayName = 'PageTree';

export default PageTree;
