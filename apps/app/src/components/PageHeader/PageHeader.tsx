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
    <div className={moduleClass}>
      <PagePathHeader
        currentPage={currentPage}
      />
      <PageTitleHeader
        className="mt-2"
        currentPage={currentPage}
      />
    </div>
  );
};
