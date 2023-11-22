import { FC } from 'react';

import { useCurrentPagePath, useSWRxCurrentPage } from '~/stores/page';

import { PagePathHeader } from './PagePathHeader';
import { PageTitleHeader } from './PageTitleHeader';

export const PageHeader: FC = () => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: currentPage } = useSWRxCurrentPage();

  if (currentPage == null || currentPagePath == null) {
    return <></>;
  }

  return (
    <>
      <div>
        <PagePathHeader
          currentPagePath={currentPagePath}
          currentPage={currentPage}
        />
        <PageTitleHeader
          currentPagePath={currentPagePath}
          currentPage={currentPage}
        />
      </div>
    </>
  );
};
