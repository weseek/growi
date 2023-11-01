import { FC, memo, useCallback } from 'react';

import dynamic from 'next/dynamic';

import { SidebarContentsType, SidebarMode } from '~/interfaces/ui';
import { useCollapsedContentsOpened, useCurrentSidebarContents, useSidebarMode } from '~/stores/ui';

import styles from './PrimaryItems.module.scss';


const InAppNotificationDropdown = dynamic(() => import('../../InAppNotification/InAppNotificationDropdown')
  .then(mod => mod.InAppNotificationDropdown), { ssr: false });


/**
 * @returns String for className to switch the indicator is active or not
 */
const useIndicator = (sidebarMode: SidebarMode, isSelected: boolean): string => {
  const { data: isCollapsedContentsOpened } = useCollapsedContentsOpened();

  if (sidebarMode === SidebarMode.COLLAPSED && !isCollapsedContentsOpened) {
    return '';
  }

  return isSelected ? 'active' : '';
};


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

  const indicatorClass = useIndicator(sidebarMode, contents === currentContents);

  const selectThisItem = useCallback(() => {
    mutateContents(contents, false);
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
      className={`d-block btn btn-primary ${indicatorClass}`}
      onClick={itemClickedHandler}
      onMouseEnter={mouseEnteredHandler}
    >
      <span className="material-symbols-outlined">{iconName}</span>
    </button>
  );
};


type Props = {
  onItemHover?: (contents: SidebarContentsType) => void,
}

export const PrimaryItems = memo((props: Props) => {
  const { onItemHover } = props;

  const { data: sidebarMode } = useSidebarMode();

  if (sidebarMode == null) {
    return <></>;
  }

  return (
    <div className={styles['grw-primary-items']}>
      <PrimaryItem sidebarMode={sidebarMode} contents={SidebarContentsType.TREE} label="Page Tree" iconName="format_list_bulleted" onHover={onItemHover} />
      <PrimaryItem sidebarMode={sidebarMode} contents={SidebarContentsType.CUSTOM} label="Custom Sidebar" iconName="code" onHover={onItemHover} />
      <PrimaryItem sidebarMode={sidebarMode} contents={SidebarContentsType.RECENT} label="Recent Changes" iconName="update" onHover={onItemHover} />
      <PrimaryItem sidebarMode={sidebarMode} contents={SidebarContentsType.BOOKMARKS} label="Bookmarks" iconName="bookmarks" onHover={onItemHover} />
      <PrimaryItem sidebarMode={sidebarMode} contents={SidebarContentsType.TAG} label="Tags" iconName="local_offer" onHover={onItemHover} />
      <InAppNotificationDropdown />
    </div>
  );
});
