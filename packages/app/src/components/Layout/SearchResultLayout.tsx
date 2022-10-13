import React, { ReactNode } from 'react';

import { BasicLayout } from '~/components/Layout/BasicLayout';

import commonStyles from './SearchResultLayout.module.scss';

type Props = {
  title: string,
  className?: string,
  children?: ReactNode,
}

const SearchResultLayout = ({
  children, title, className,
}: Props): JSX.Element => {

  const classNames: string[] = [];
  if (className != null) {
    classNames.push(className);
  }

  return (
    <div className={`on-search ${commonStyles['on-search']}`}>
      <BasicLayout title={title} className={classNames.join(' ')}>
        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>
        <div id="main" className="main search-page mt-0">
          { children }
        </div>
      </BasicLayout>
    </div>
  );
};

export default SearchResultLayout;
