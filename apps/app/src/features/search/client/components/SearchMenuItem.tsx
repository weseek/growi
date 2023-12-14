
import React from 'react';

type Props = {
  url: string
  index: number
  highlightedIndex: number | null
  getItemProps: any
  children: React.ReactNode
}

export const SearchMenuItem = (props: Props): JSX.Element => {
  const {
    url, getItemProps, index, highlightedIndex, children,
  } = props;

  const option = {
    index,
    item: { url },
    className: 'mb-2 d-flex',
    style: { backgroundColor: highlightedIndex === index ? 'lightgray' : 'white', pointer: 'cursor' },
  };

  return (
    <li className="text-muted d-flex" {...getItemProps(option)}>
      { children }
    </li>
  );
};
