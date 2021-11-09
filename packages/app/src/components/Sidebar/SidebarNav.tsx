import React, { FC, useCallback } from 'react';

import { SidebarContents } from '~/interfaces/ui';
import { useCurrentUser, useIsSharedUser } from '~/stores/context';
import { useCurrentSidebarContents } from '~/stores/ui';


type PrimaryItemProps = {
  contents: SidebarContents,
  label: string,
  iconName: string,
  onItemSelected: (contents: SidebarContents) => void,
}

const PrimaryItem: FC<PrimaryItemProps> = (props: PrimaryItemProps) => {
  const {
    contents, iconName, onItemSelected,
  } = props;

  // TODO: migrate from NavigationContainer
  const { data: currentContents, mutate } = useCurrentSidebarContents();

  const isSelected = contents === currentContents;

  const itemSelectedHandler = useCallback(() => {
    // const { navigationContainer, onItemSelected } = this.props;
    if (onItemSelected != null) {
      onItemSelected(contents);
    }

    mutate(contents);
  }, [contents, mutate, onItemSelected]);

  return (
    <button
      type="button"
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

const SecondaryItem: FC<SecondaryItemProps> = (props: SecondaryItemProps) => {
  const { iconName, href, isBlank } = props;

  return (
    <a href={href} className="d-block btn btn-primary" target={`${isBlank ? '_blank' : ''}`}>
      <i className="material-icons">{iconName}</i>
    </a>
  );
};


type Props = {
  onItemSelected: (contents: SidebarContents) => void,
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
        {!isSharedUser && <PrimaryItem contents={SidebarContents.CUSTOM} label="Custom Sidebar" iconName="code" onItemSelected={onItemSelected} />}
        {!isSharedUser && <PrimaryItem contents={SidebarContents.RECENT} label="Recent Changes" iconName="update" onItemSelected={onItemSelected} />}
        {/* <PrimaryItem id="tag" label="Tags" iconName="icon-tag" /> */}
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
