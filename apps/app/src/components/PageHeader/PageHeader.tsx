import type { FC } from 'react';

import { useSWRxCurrentPage } from '~/stores/page';

import { PagePathHeader } from './PagePathHeader';
import { PageTitleHeader } from './PageTitleHeader';


export const PageHeader: FC = () => {
  const { data: currentPage } = useSWRxCurrentPage();

  if (currentPage == null) {
    return <></>;
  }

  return (
    <>
      <PagePathHeader
        currentPage={currentPage}
      />
      <PageTitleHeader
        currentPage={currentPage}
      />
    </>
  );
};
