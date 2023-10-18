import { FC, memo, useCallback } from 'react';

import dynamic from 'next/dynamic';

import { scheduleToPut } from '~/client/services/user-ui-settings';
import { SidebarContentsType } from '~/interfaces/ui';
import { useCurrentSidebarContents } from '~/stores/ui';

import styles from './PrimaryItems.module.scss';


const InAppNotificationDropdown = dynamic(() => import('../../InAppNotification/InAppNotificationDropdown')
  .then(mod => mod.InAppNotificationDropdown), { ssr: false });


type PrimaryItemProps = {
  contents: SidebarContentsType,
  label: string,
  iconName: string,
  onItemSelected?: (contents: SidebarContentsType) => void,
}

const PrimaryItem: FC<PrimaryItemProps> = (props: PrimaryItemProps) => {
  const {
    contents, label, iconName, onItemSelected,
  } = props;

  const { data: currentContents, mutate } = useCurrentSidebarContents();

  const isSelected = contents === currentContents;

  const itemSelectedHandler = useCallback(() => {
    mutate(contents, false);
    scheduleToPut({ currentSidebarContents: contents });
    onItemSelected?.(contents);
  }, [contents, mutate, onItemSelected]);

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
  return (
    <div className={styles['grw-primary-items']}>
      <PrimaryItem contents={SidebarContentsType.TREE} label="Page Tree" iconName="format_list_bulleted" />
      <PrimaryItem contents={SidebarContentsType.CUSTOM} label="Custom Sidebar" iconName="code" />
      <PrimaryItem contents={SidebarContentsType.RECENT} label="Recent Changes" iconName="update" />
      <PrimaryItem contents={SidebarContentsType.BOOKMARKS} label="Bookmarks" iconName="bookmark" />
      <PrimaryItem contents={SidebarContentsType.TAG} label="Tags" iconName="local_offer" />
      <InAppNotificationDropdown />
    </div>
  );
});
