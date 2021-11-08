import React, { FC, ReactNode, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { IPage } from '../../../interfaces/page';

import Item from './Item';


type Props = {
}

// TODO: use swr for state
const ancestors: IPage[] = [];
const target: IPage = {};
const siblings: IPage[] = [];
const ancestorsSiblings: IPage[] = [];

const PageTree:FC<Props> = (props: Props) => {
  const { t } = useTranslation();


  return (
    <>
      { ancestors && ancestors.length > 0 && () }
    </>
  );
};

export default PageTree;
