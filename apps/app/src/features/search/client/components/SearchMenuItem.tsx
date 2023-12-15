
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
    url, index, highlightedIndex, getItemProps, children,
  } = props;

  const itemMenuOptions = useMemo(() => {
    return getItemProps({
      index,
      item: { url },
      style: { backgroundColor: highlightedIndex === index ? 'lightgray' : 'white', cursor: 'pointer' },
      className: 'text-muted mb-2 d-flex',
    });
  }, [getItemProps, highlightedIndex, index, url]);

  return (
    <li {...itemMenuOptions}>
      { children }
    </li>
  );
};
