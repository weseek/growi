import { FC, memo, useCallback } from 'react';

import dynamic from 'next/dynamic';

import { useUserUISettings } from '~/client/services/user-ui-settings';
import { SidebarContentsType } from '~/interfaces/ui';
import { useCurrentSidebarContents, useDrawerMode, useSidebarCollapsed } from '~/stores/ui';

import styles from './PrimaryItems.module.scss';


const InAppNotificationDropdown = dynamic(() => import('../../InAppNotification/InAppNotificationDropdown')
  .then(mod => mod.InAppNotificationDropdown), { ssr: false });


type PrimaryItemProps = {
  contents: SidebarContentsType,
  label: string,
  iconName: string,
  onItemSelected: (contents: SidebarContentsType) => void,
}

const PrimaryItem: FC<PrimaryItemProps> = (props: PrimaryItemProps) => {
  const {
    contents, label, iconName, onItemSelected,
  } = props;

  const { data: currentContents, mutate } = useCurrentSidebarContents();
  const { scheduleToPut } = useUserUISettings();

  const isSelected = contents === currentContents;

  const itemSelectedHandler = useCallback(() => {
    if (onItemSelected != null) {
      onItemSelected(contents);
    }

    mutate(contents, false);

    scheduleToPut({ currentSidebarContents: contents });
  }, [contents, mutate, onItemSelected, scheduleToPut]);

  const labelForTestId = label.toLowerCase().replace(' ', '-');

  return (
    <button
      type="button"
      data-testid={`grw-sidebar-nav-primary-${labelForTestId}`}
      className={`d-block btn btn-primary ${isSelected ? 'active' : ''}`}
      onClick={itemSelectedHandler}
    >
      <i className="material-icons">{iconName}</i>
    </button>
  );
};

export const PrimaryItems: FC = memo(() => {

  const { scheduleToPut } = useUserUISettings();

  const { data: isDrawerMode } = useDrawerMode();
  const { data: currentContents } = useCurrentSidebarContents();
  const { data: isCollapsed, mutate: mutateSidebarCollapsed } = useSidebarCollapsed();

  const itemSelectedHandler = useCallback((selectedContents) => {
    if (isDrawerMode) {
      return;
    }

    let newValue = false;

    // already selected
    if (currentContents === selectedContents) {
      // toggle collapsed
      newValue = !isCollapsed;
    }

    mutateSidebarCollapsed(newValue, false);
    scheduleToPut({ isSidebarCollapsed: newValue });

  }, [currentContents, isCollapsed, isDrawerMode, mutateSidebarCollapsed, scheduleToPut]);

  return (
    <div className={styles['grw-primary-items']}>
      <PrimaryItem contents={SidebarContentsType.TREE} label="Page Tree" iconName="format_list_bulleted" onItemSelected={itemSelectedHandler} />
      <PrimaryItem contents={SidebarContentsType.CUSTOM} label="Custom Sidebar" iconName="code" onItemSelected={itemSelectedHandler} />
      <PrimaryItem contents={SidebarContentsType.RECENT} label="Recent Changes" iconName="update" onItemSelected={itemSelectedHandler} />
      <PrimaryItem contents={SidebarContentsType.BOOKMARKS} label="Bookmarks" iconName="bookmark" onItemSelected={itemSelectedHandler} />
      <PrimaryItem contents={SidebarContentsType.TAG} label="Tags" iconName="local_offer" onItemSelected={itemSelectedHandler} />
      <InAppNotificationDropdown />
    </div>
  );
});
