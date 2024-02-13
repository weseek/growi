import type { FC } from 'react';

import { useSWRxCurrentPage } from '~/stores/page';

import { PagePathHeader } from './PagePathHeader';
import { PageTitleHeader } from './PageTitleHeader';

import styles from './PageHeader.module.scss';


export const PageHeader: FC = () => {
  const { data: currentPage } = useSWRxCurrentPage();

  if (currentPage == null) {
    return <></>;
  }

  return (
    <div className={`${styles['page-header']}`}>
      <PagePathHeader
        currentPage={currentPage}
      />
      <PageTitleHeader
        currentPage={currentPage}
      />
    </div>
  );
};
