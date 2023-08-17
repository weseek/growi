import React, { ReactNode } from 'react';

import { BasicLayout } from '~/components/Layout/BasicLayout';

import commonStyles from './SearchResultLayout.module.scss';

type Props = {
  children?: ReactNode,
}

const SearchResultLayout = ({ children }: Props): JSX.Element => {

  return (
    <BasicLayout className={`on-search ${commonStyles['on-search']}`}>
      <div id="main" className="main search-page mt-0">
        { children }
      </div>
    </BasicLayout>
  );
};

export default SearchResultLayout;
