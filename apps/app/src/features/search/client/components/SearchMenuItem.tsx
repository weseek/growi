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
      className: `d-flex p-1 ${isActive ? 'text-bg-primary' : ''}`,
    })
  );

  return (
    <li {...itemMenuOptions}>
      { children }
    </li>
  );
};
