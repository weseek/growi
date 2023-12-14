
import React, { useMemo } from 'react';

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

  const itemMenuOption = useMemo(() => {
    return {
      index,
      item: { url },
      style: { backgroundColor: highlightedIndex === index ? 'lightgray' : 'white', cursor: 'pointer' },
      className: 'text-muted mb-2 d-flex',
    };
  }, [highlightedIndex, index, url]);

  return (
    <li {...getItemProps(itemMenuOption)}>
      { children }
    </li>
  );
};
