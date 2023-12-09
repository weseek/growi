import React, { useCallback } from 'react';

import { useRouter } from 'next/router';
import { ListGroupItem } from 'reactstrap';

import styles from './SearchMenuItem.module.scss';

type Props = {
  children: React.ReactNode
  href: string
  onClick?: () => void
}

export const SearchMenuItem = (props: Props): JSX.Element => {
  const { children, href, onClick } = props;
  const router = useRouter();

  const clickMenuItemHandler = useCallback(() => {
    router.push(href);

    if (onClick != null) {
      onClick();
    }
  }, [href, onClick, router]);

  return (
    <ListGroupItem
      href={href}
      onClick={clickMenuItemHandler}
      className={`search-menu-item ${styles['search-menu-item']} list-group-item list-group-item-action border-0 text-muted p-1 d-flex`}
    >
      { children }
    </ListGroupItem>
  );
};
