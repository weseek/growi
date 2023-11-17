import { useCurrentPagePath, useSWRxCurrentPage } from '~/stores/page';

import { PagePath } from './PagePath';
import { PageTitle } from './PageTitle';

export const PageHeader = () => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: currentPage } = useSWRxCurrentPage();

  if (currentPage == null) {
    return <></>;
  }

  return (
    <>
      <div className="pull-left">
        <PagePath />
        <PageTitle
          currentPagePath={currentPagePath}
          currentPage={currentPage}
        />
      </div>
    </>
  );
};
