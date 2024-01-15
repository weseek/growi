import {
  FC, memo, useCallback, useEffect,
} from 'react';

import { SidebarContentsType, SidebarMode } from '~/interfaces/ui';
import { useSWRxInAppNotificationStatus } from '~/stores/in-app-notification';
import { useDefaultSocket } from '~/stores/socket-io';
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

type PrimaryItemProps = {
  contents: SidebarContentsType,
  label: string,
  iconName: string,
  sidebarMode: SidebarMode,
  badgeContents?: number,
  onHover?: (contents: SidebarContentsType) => void,
}

const PrimaryItem: FC<PrimaryItemProps> = (props: PrimaryItemProps) => {
  const {
    contents, label, iconName, sidebarMode, badgeContents,
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
      <div className="position-relative">
        { badgeContents != null && (
          <span className="position-absolute badge rounded-pill bg-primary">{badgeContents}</span>
        )}
        <span className="material-symbols-outlined">{iconName}</span>
      </div>
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
    </div>
  );
});

export const PrimaryItemsForNotification = memo((props: Props) => {
  const { onItemHover } = props;

  const { data: sidebarMode } = useSidebarMode();

  const { data: socket } = useDefaultSocket();

  const { data: notificationCount, mutate: mutateNotificationCount } = useSWRxInAppNotificationStatus();

  const badgeContents = notificationCount != null && notificationCount > 0 ? notificationCount : undefined;

  useEffect(() => {
    if (socket != null) {
      socket.on('notificationUpdated', () => {
        mutateNotificationCount();
      });

      // clean up
      return () => {
        socket.off('notificationUpdated');
      };
    }
  }, [mutateNotificationCount, socket]);


  if (sidebarMode == null) {
    return <></>;
  }

  return (
    <div className={styles['grw-primary-items']}>
      <PrimaryItem
        sidebarMode={sidebarMode}
        contents={SidebarContentsType.NOTIFICATION}
        label="In-App Notification"
        iconName="notifications"
        onHover={onItemHover}
        badgeContents={badgeContents}
      />
    </div>
  );
});
