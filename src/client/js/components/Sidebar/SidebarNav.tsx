import Link from 'next/link';
import React, { FC, useCallback } from 'react';
import { useCurrentUser, useIsSharedUser } from '~/stores/context';


type PrimaryItemProps = {
  id: string,
  label: string,
  iconName: string,
  onItemSelected: (contentsId: string) => void,
}

const PrimaryItem: FC<PrimaryItemProps> = (props: PrimaryItemProps) => {
  const {
    id, iconName, onItemSelected,
  } = props;

  // TODO: migrate from NavigationContainer
  // const sidebarContentsId = useCurrentSidebarContentsId();
  const sidebarContentsId = '';
  const isSelected = sidebarContentsId === id;

  const itemSelectedHandler = useCallback((contentsId: string): void => {
    // const { navigationContainer, onItemSelected } = this.props;
    if (onItemSelected != null) {
      onItemSelected(contentsId);
    }

    // navigationContainer.setState({ sidebarContentsId: contentsId });
  }, [onItemSelected]);

  return (
    <button
      type="button"
      className={`d-block btn btn-primary ${isSelected ? 'active' : ''}`}
      onClick={() => itemSelectedHandler(id)}
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
    <Link href={href}>
      <a href={href} className="d-block btn btn-primary" target={`${isBlank ? '_blank' : ''}`}>
        <i className="material-icons">{iconName}</i>
      </a>
    </Link>
  );
};


type Props = {
  onItemSelected: (contentsId: string) => void,
}


const SidebarNav: FC<Props> = (props: Props) => {

  const { data: isSharedUser } = useIsSharedUser();
  const { data: currentUser } = useCurrentUser();

  const isAdmin = currentUser.admin;
  const isLoggedIn = currentUser != null;

  const { onItemSelected } = props;

  return (
    <div className="grw-sidebar-nav">
      <div className="grw-sidebar-nav-primary-container">
        {!isSharedUser && <PrimaryItem id="custom" label="Custom Sidebar" iconName="code" onItemSelected={onItemSelected} />}
        {!isSharedUser && <PrimaryItem id="recent" label="Recent Changes" iconName="update" onItemSelected={onItemSelected} />}
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
