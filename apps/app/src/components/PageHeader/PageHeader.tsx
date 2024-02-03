import { type FC, useState } from 'react';

import { useCurrentPagePath, useSWRxCurrentPage } from '~/stores/page';

import { PagePathHeader } from './PagePathHeader';
import { PageTitleHeader } from './PageTitleHeader';

export const PageHeader: FC = () => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: currentPage } = useSWRxCurrentPage();

  const [editingPagePath, setEditingPagePath] = useState(currentPagePath ?? '');

  const editingPagePathHandler = { editingPagePath, setEditingPagePath };

  if (currentPage == null || currentPagePath == null) {
    return <></>;
  }

  return (
    <>
      <PagePathHeader
        currentPagePath={currentPagePath}
        currentPage={currentPage}
        editingPagePathHandler={editingPagePathHandler}
      />
      <PageTitleHeader
        currentPagePath={currentPagePath}
        currentPage={currentPage}
        editingPagePathHandler={editingPagePathHandler}
      />
    </>
  );
};
