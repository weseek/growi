import type { FC } from 'react';

import { useSWRxCurrentPage } from '~/stores/page';

import { PagePathHeader } from './PagePathHeader';
import { PageTitleHeader } from './PageTitleHeader';

import styles from './PageHeader.module.scss';

const moduleClass = styles['page-header'] ?? '';

export const PageHeader: FC = () => {
  const { data: currentPage } = useSWRxCurrentPage();

  if (currentPage == null) {
    return <></>;
  }

  return (
    <div className={`${moduleClass} w-100`}>
      <PagePathHeader
        currentPage={currentPage}
      />
      <div className="row mt-1">
        <PageTitleHeader
          className="col"
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};
