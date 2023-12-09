import React from 'react';

import { useRouter } from 'next/router';
import { ListGroupItem } from 'reactstrap';

import styles from './SearchMenuItem.module.scss';

type Props = {
  children: React.ReactNode
  href: string
}

export const SearchMenuItem = (props: Props): JSX.Element => {
  const { children, href } = props;
  const router = useRouter();

  return (
    <ListGroupItem
      href={href}
      onClick={() => { router.push(href) }}
      className={`search-menu-item ${styles['search-menu-item']} list-group-item list-group-item-action border-0 text-muted p-1 d-flex`}
    >
      { children }
    </ListGroupItem>
  );
};
