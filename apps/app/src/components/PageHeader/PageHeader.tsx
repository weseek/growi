import { FC } from 'react';

import { useCurrentPagePath, useSWRxCurrentPage } from '~/stores/page';

import { PagePath } from './PagePath';
import { PageTitle } from './PageTitle';

export const PageHeader: FC = () => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: currentPage } = useSWRxCurrentPage();

  if (currentPage == null || currentPagePath == null) {
    return <></>;
  }

  return (
    <>
      <div className="pull-left">
        <PagePath
          currentPagePath={currentPagePath}
          currentPage={currentPage}
        />
        <PageTitle
          currentPagePath={currentPagePath}
          currentPage={currentPage}
        />
      </div>
    </>
  );
};
