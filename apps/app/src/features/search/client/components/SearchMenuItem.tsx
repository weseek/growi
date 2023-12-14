
import React from 'react';

import type { GetItemProps } from '../interfaces/downshift';

type Props = {
  url: string
  index: number
  highlightedIndex: number | null
  getItemProps: GetItemProps
  children: React.ReactNode
}

export const SearchMenuItem = (props: Props): JSX.Element => {
  const {
    url, getItemProps, index, highlightedIndex, children,
  } = props;

  const option = {
    index,
    item: { url },
    style: { backgroundColor: highlightedIndex === index ? 'lightgray' : 'white', pointer: 'cursor' },
  };

  return (
    <li className="text-muted mb-2 d-flex" {...getItemProps(option)}>
      { children }
    </li>
  );
};
