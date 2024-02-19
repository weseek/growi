import React, { memo, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import {
  UncontrolledButtonDropdown, DropdownMenu, DropdownToggle, DropdownItem,
} from 'reactstrap';

import { useTargetAndAncestors, useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';
import { useCurrentPagePath, useCurrentPageId } from '~/stores/page';
import { mutatePageTree, useSWRxRootPage, useSWRxV5MigrationStatus } from '~/stores/page-listing';

import { ItemsTree } from '../../ItemsTree/ItemsTree';
import { PageTreeItem } from '../PageTreeItem';
import { SidebarHeaderReloadButton } from '../SidebarHeaderReloadButton';

import { PrivateLegacyPagesLink } from './PrivateLegacyPagesLink';

type PageTreeHeaderProps = {
  isShownWipPage: boolean,
  onClickWipPageVisibilityItem: () => void
}

export const PageTreeHeader = memo((props: PageTreeHeaderProps) => {
  const { isShownWipPage, onClickWipPageVisibilityItem } = props;

  const { mutate: mutateRootPage } = useSWRxRootPage({ suspense: true });
  useSWRxV5MigrationStatus({ suspense: true });

  const mutate = useCallback(() => {
    mutateRootPage();
    mutatePageTree();
  }, [mutateRootPage]);

  return (
    <>
      <SidebarHeaderReloadButton onClick={() => mutate()} />

      <UncontrolledButtonDropdown className="me-1">
        <DropdownToggle color="transparent" className="p-0 border-0">
          <span className="material-symbols-outlined">more_horiz</span>
        </DropdownToggle>

        <DropdownMenu container="body">
          <DropdownItem onClick={onClickWipPageVisibilityItem} className="mt-2">
            <div className="form-check form-switch">
              <input
                id="switchWipPageVisibility"
                className="form-check-input"
                type="checkbox"
                checked={isShownWipPage}
              />
              <label className="form-label form-check-label text-muted" htmlFor="switchWipPageVisibility">
                WIP を表示
              </label>
            </div>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>
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
        CustomTreeItem={PageTreeItem}
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
