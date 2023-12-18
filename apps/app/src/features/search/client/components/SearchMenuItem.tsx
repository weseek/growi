import React from 'react';

import type { GetItemProps } from '../interfaces/downshift';

type Props = {
  url: string
  index: number
  isActive: boolean
  getItemProps: GetItemProps
  children: React.ReactNode
}

export const SearchMenuItem = (props: Props): JSX.Element => {
  const {
    url, index, isActive, getItemProps, children,
  } = props;

  const itemMenuOptions = (
    getItemProps({
      index,
      item: { url },
      style: { backgroundColor: isActive ? 'lightblue' : 'white', cursor: 'pointer' },
      className: 'text-muted mb-2 d-flex',
    })
  );

  return (
    <li {...itemMenuOptions}>
      { children }
    </li>
  );
};
