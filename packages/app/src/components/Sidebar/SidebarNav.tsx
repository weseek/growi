import React, { FC, memo, useCallback } from 'react';

import { scheduleToPutUserUISettings } from '~/client/services/user-ui-settings';
import { SidebarContentsType } from '~/interfaces/ui';
import { useCurrentUser, useIsSharedUser } from '~/stores/context';
import { useCurrentSidebarContents } from '~/stores/ui';


type PrimaryItemProps = {
  contents: SidebarContentsType,
  label: string,
  iconName: string,
  onItemSelected: (contents: SidebarContentsType) => void,
}

const PrimaryItem: FC<PrimaryItemProps> = (props: PrimaryItemProps) => {
  const {
    contents, iconName, onItemSelected,
  } = props;

  const { data: currentContents, mutate } = useCurrentSidebarContents();

  const isSelected = contents === currentContents;

  const itemSelectedHandler = useCallback(() => {
    if (onItemSelected != null) {
      onItemSelected(contents);
    }

    mutate(contents, false);
    scheduleToPutUserUISettings({ currentSidebarContents: contents });
  }, [contents, mutate, onItemSelected]);

  return (
    <button
      type="button"
      data-testid={props.label === 'Page Tree' ? 'sidebar-pagetree' : ''}
      className={`d-block btn btn-primary ${isSelected ? 'active' : ''}`}
      onClick={itemSelectedHandler}
    >
      <i className="material-icons">{iconName}</i>
    </button>
  );
};

type SecondaryItemProps = {
  label: string,
  href: string,
  iconName: string,
  isBlank?: boolean,
}

const SecondaryItem: FC<SecondaryItemProps> = memo((props: SecondaryItemProps) => {
  const { iconName, href, isBlank } = props;

  return (
    <a href={href} className="d-block btn btn-primary" target={`${isBlank ? '_blank' : ''}`}>
      <i className="material-icons">{iconName}</i>
    </a>
  );
});


type Props = {
  onItemSelected: (contents: SidebarContentsType) => void,
}

const SidebarNav: FC<Props> = (props: Props) => {

  const { data: isSharedUser } = useIsSharedUser();
  const { data: currentUser } = useCurrentUser();

  const isAdmin = currentUser?.admin;
  const isLoggedIn = currentUser != null;

  const { onItemSelected } = props;

  return (
    <div className="grw-sidebar-nav">
      <div className="grw-sidebar-nav-primary-container">
        {!isSharedUser && <PrimaryItem contents={SidebarContentsType.CUSTOM} label="Custom Sidebar" iconName="code" onItemSelected={onItemSelected} />}
        {!isSharedUser && <PrimaryItem contents={SidebarContentsType.RECENT} label="Recent Changes" iconName="update" onItemSelected={onItemSelected} />}
        {!isSharedUser && <PrimaryItem contents={SidebarContentsType.TREE} label="Page Tree" iconName="format_list_bulleted" onItemSelected={onItemSelected} />}
        {/* <PrimaryItem id="tag" label="Tags" iconName="icon-tag" /> */}
        {/* <PrimaryItem id="favorite" label="Favorite" iconName="fa fa-bookmark-o" /> */}
        {!isSharedUser && <PrimaryItem contents={SidebarContentsType.TAG} label="Tags" iconName="tag" onItemSelected={onItemSelected} /> }
        {/* <PrimaryItem id="favorite" label="Favorite" iconName="icon-star" /> */}
      </div>
      <div className="grw-sidebar-nav-secondary-container">
        {isAdmin && <SecondaryItem label="Admin" iconName="settings" href="/admin" />}
        {isLoggedIn && <SecondaryItem label="Draft" iconName="file_copy" href="/me/drafts" />}
        <SecondaryItem label="Help" iconName="help" href="https://docs.growi.org" isBlank />
        <SecondaryItem label="Trash" iconName="delete" href="/trash" />
      </div>
    </div>
  );

};

export default SidebarNav;
