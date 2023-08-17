import React, { memo, useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { useTargetAndAncestors, useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';
import { useCurrentPagePath, useCurrentPageId } from '~/stores/page';
import { mutatePageTree, useSWRxRootPage, useSWRxV5MigrationStatus } from '~/stores/page-listing';

import { SidebarHeaderReloadButton } from '../SidebarHeaderReloadButton';

import ItemsTree from './ItemsTree';
import { PrivateLegacyPagesLink } from './PrivateLegacyPagesLink';


export const PageTreeHeader = memo(() => {
  const { mutate: mutateRootPage } = useSWRxRootPage({ suspense: true });
  useSWRxV5MigrationStatus({ suspense: true });

  const mutate = useCallback(() => {
    mutateRootPage();
    mutatePageTree();
  }, [mutateRootPage]);

  return (
    <>
      <SidebarHeaderReloadButton onClick={() => mutate()} />
    </>
  );
});
PageTreeHeader.displayName = 'PageTreeHeader';


const PageTreeUnavailable = () => {
  const { t } = useTranslation();

  // TODO : improve design
  // Story : https://redmine.weseek.co.jp/issues/83755
  return (
    <div className="mt-5 mx-2 text-center">
      <h3 className="text-gray">{t('v5_page_migration.page_tree_not_avaliable')}</h3>
      <a href="/admin">{t('v5_page_migration.go_to_settings')}</a>
    </div>
  );
};

export const PageTreeContent = memo(() => {
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: currentPath } = useCurrentPagePath();
  const { data: targetId } = useCurrentPageId();
  const { data: targetAndAncestorsData } = useTargetAndAncestors();

  const { data: migrationStatus } = useSWRxV5MigrationStatus({ suspense: true });

  const targetPathOrId = targetId || currentPath;

  if (!migrationStatus?.isV5Compatible) {
    return <PageTreeUnavailable />;
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
      <ItemsTree
        isEnableActions={!isGuestUser}
        isReadOnlyUser={!!isReadOnlyUser}
        targetPath={path}
        targetPathOrId={targetPathOrId}
        targetAndAncestorsData={targetAndAncestorsData}
      />

      {!isGuestUser && !isReadOnlyUser && migrationStatus?.migratablePagesCount != null && migrationStatus.migratablePagesCount !== 0 && (
        <div className="grw-pagetree-footer border-top py-3 w-100">
          <div className="private-legacy-pages-link px-3 py-2">
            <PrivateLegacyPagesLink />
          </div>
        </div>
      )}
    </>
  );
});

PageTreeContent.displayName = 'PageTreeContent';
