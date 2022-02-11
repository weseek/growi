import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSWRxV5MigrationStatus } from '~/stores/page-listing';
import {
  useCurrentPagePath, useCurrentPageId, useTargetAndAncestors, useIsGuestUser, useNotFoundTargetPathOrId,
} from '~/stores/context';

import ItemsTree from './PageTree/ItemsTree';
import PrivateLegacyPages from './PageTree/PrivateLegacyPages';

import AppContainer from '~/client/services/AppContainer';

type Props = {
  appContainer: AppContainer,
};

const PageTree: FC<Props> = memo((props: Props) => {
  const { t } = useTranslation();

  const { data: isGuestUser } = useIsGuestUser();
  const { data: currentPath } = useCurrentPagePath();
  const { data: targetId } = useCurrentPageId();
  const { data: targetAndAncestorsData } = useTargetAndAncestors();
  const { data: notFoundTargetPathOrIdData } = useNotFoundTargetPathOrId();
  const { data: migrationStatus } = useSWRxV5MigrationStatus();

  const targetPathOrId = targetId || notFoundTargetPathOrIdData?.notFoundTargetPathOrId;

  if (migrationStatus == null) {
    return (
      <>
        <div className="grw-sidebar-content-header p-3">
          <h3 className="mb-0">{t('Page Tree')}</h3>
        </div>
        <div className="mt-5 mx-2 text-center">
          <h3 className="text-gray">Page Tree now loading...</h3>
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

      <div className="grw-sidebar-content-body">
        <ItemsTree
          appContainer={props.appContainer}
          isEnableActions={!isGuestUser}
          targetPath={path}
          targetPathOrId={targetPathOrId}
          targetAndAncestorsData={targetAndAncestorsData}
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
