import { useState } from 'react';
import type { Dispatch, SetStateAction, FC } from 'react';

import { useSWRxCurrentPage } from '~/stores/page';

import { PagePathHeader } from './PagePathHeader';
import { PageTitleHeader } from './PageTitleHeader';

export type editedPagePathState = {
  editedPagePath: string
  setEditedPagePath: Dispatch<SetStateAction<string>>
}

export const PageHeader: FC = () => {
  const { data: currentPage } = useSWRxCurrentPage();
  const currentPagePath = currentPage?.path;


  const [editedPagePath, setEditedPagePath] = useState(currentPagePath ?? '');

  const editedPagePathState = { editedPagePath, setEditedPagePath };

  if (currentPage == null) {
    return <></>;
  }

  return (
    <>
      <PagePathHeader
        currentPage={currentPage}
        editedPagePathState={editedPagePathState}
      />
      <PageTitleHeader
        currentPage={currentPage}
        editedPagePathState={editedPagePathState}
      />
    </>
  );
};
