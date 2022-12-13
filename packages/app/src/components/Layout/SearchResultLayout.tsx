import React, { ReactNode } from 'react';

import { BasicLayout } from '~/components/Layout/BasicLayout';

import commonStyles from './SearchResultLayout.module.scss';

type Props = {
  children?: ReactNode,
}

const SearchResultLayout = ({
  children,
}: Props): JSX.Element => {

  return (
    <div className={`on-search ${commonStyles['on-search']}`}>
      <BasicLayout>
        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>
        <div id="main" className="main search-page mt-0">
          { children }
        </div>
      </BasicLayout>
    </div>
  );
};

export default SearchResultLayout;
