import { FC, memo, useCallback } from 'react';

import { SidebarContentsType, SidebarMode } from '~/interfaces/ui';
import { useSWRxInAppNotificationStatus } from '~/stores/in-app-notification';
import { useCollapsedContentsOpened, useCurrentSidebarContents, useSidebarMode } from '~/stores/ui';

import styles from './PrimaryItems.module.scss';

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

const NotificationIconWithCountBadge = (): JSX.Element => {
  const { data: inAppNotificationStatus } = useSWRxInAppNotificationStatus();

  return (
    <div className="position-relative">
      <span className="badge rounded-pill bg-primary notification-count-badge">{inAppNotificationStatus}</span>
      <span className="material-symbols-outlined">notifications</span>
    </div>
  );
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

  const { data: currentContents, mutateAndSave: mutateContents } = useCurrentSidebarContents();

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
      className={`btn btn-primary ${indicatorClass}`}
      onClick={itemClickedHandler}
      onMouseEnter={mouseEnteredHandler}
    >
      { contents === SidebarContentsType.NOTIFICATION
        ? <NotificationIconWithCountBadge />
        : <span className="material-symbols-outlined">{iconName}</span>
      }
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
      <PrimaryItem
        sidebarMode={sidebarMode}
        contents={SidebarContentsType.NOTIFICATION}
        label="In-App Notification"
        iconName="notifications"
        onHover={onItemHover}
      />
    </div>
  );
});
