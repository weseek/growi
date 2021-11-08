import React, { memo, ReactNode } from 'react';
import { IPage } from '../../../interfaces/page';

type Props = {
  page: IPage
  isOpen: boolean
  isTarget: boolean
  children?: ReactNode
}

const Item = memo<Props>((props: Props) => {
  const { children } = props;
  return (
    <>
      Item
      {children}
    </>
  );
});

export default Item;
