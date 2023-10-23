import { FC, memo, useCallback } from 'react';

import dynamic from 'next/dynamic';

import { scheduleToPut } from '~/client/services/user-ui-settings';
import { SidebarContentsType, SidebarMode } from '~/interfaces/ui';
import {
  useCurrentSidebarContents, useCollapsedMode, useDrawerMode,
} from '~/stores/ui';

import styles from './PrimaryItems.module.scss';


const InAppNotificationDropdown = dynamic(() => import('../../InAppNotification/InAppNotificationDropdown')
  .then(mod => mod.InAppNotificationDropdown), { ssr: false });


type PrimaryItemProps = {
  contents: SidebarContentsType,
  label: string,
  iconName: string,
  sidebarMode: SidebarMode,
  onHover?: (contents: SidebarContentsType) => void,
}

const PrimaryItem: FC<PrimaryItemProps> = (props: PrimaryItemProps) => {
  const {
    contents, label, iconName, sidebarMode,
    onHover,
  } = props;

  const { data: currentContents, mutate: mutateContents } = useCurrentSidebarContents();

  const isSelected = contents === currentContents;

  const selectThisItem = useCallback(() => {
    mutateContents(contents, false);
    scheduleToPut({ currentSidebarContents: contents });
  }, [contents, mutateContents]);

  const itemClickedHandler = useCallback(() => {
    // do nothing ONLY WHEN the collapse mode
    if (sidebarMode === SidebarMode.COLLAPSED) {
      return;
    }

    selectThisItem();
  }, [selectThisItem, sidebarMode]);

  const mouseEnteredHandler = useCallback(() => {
    // ignore other than collapsed mode
    if (sidebarMode !== SidebarMode.COLLAPSED) {
      return;
    }

    selectThisItem();
    onHover?.(contents);
  }, [contents, onHover, selectThisItem, sidebarMode]);


  const labelForTestId = label.toLowerCase().replace(' ', '-');

  return (
    <button
      type="button"
      data-testid={`grw-sidebar-nav-primary-${labelForTestId}`}
      className={`d-block btn btn-primary ${isSelected ? 'active' : ''}`}
      onClick={itemClickedHandler}
      onMouseEnter={mouseEnteredHandler}
    >
      <i className="material-icons">{iconName}</i>
    </button>
  );
};


type Props = {
  onItemHover?: (contents: SidebarContentsType) => void,
}

export const PrimaryItems = memo((props: Props) => {
  const { onItemHover } = props;

  const { data: isCollapsedMode } = useCollapsedMode();
  const { data: isDrawerMode } = useDrawerMode();

  // eslint-disable-next-line no-nested-ternary
  const sidebarMode = isDrawerMode
    ? SidebarMode.DRAWER
    : (isCollapsedMode ? SidebarMode.COLLAPSED : SidebarMode.DOCK);

  return (
    <div className={styles['grw-primary-items']}>
      <PrimaryItem sidebarMode={sidebarMode} contents={SidebarContentsType.TREE} label="Page Tree" iconName="format_list_bulleted" onHover={onItemHover} />
      <PrimaryItem sidebarMode={sidebarMode} contents={SidebarContentsType.CUSTOM} label="Custom Sidebar" iconName="code" onHover={onItemHover} />
      <PrimaryItem sidebarMode={sidebarMode} contents={SidebarContentsType.RECENT} label="Recent Changes" iconName="update" onHover={onItemHover} />
      <PrimaryItem sidebarMode={sidebarMode} contents={SidebarContentsType.BOOKMARKS} label="Bookmarks" iconName="bookmark" onHover={onItemHover} />
      <PrimaryItem sidebarMode={sidebarMode} contents={SidebarContentsType.TAG} label="Tags" iconName="local_offer" onHover={onItemHover} />
      <InAppNotificationDropdown />
    </div>
  );
});
