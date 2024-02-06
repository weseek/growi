import { useState, useCallback } from 'react';
import type { FC } from 'react';

import nodePath from 'path';

import { pathUtils } from '@growi/core/dist/utils';

import { useSWRxCurrentPage } from '~/stores/page';

import { PagePathHeader } from './PagePathHeader';
import { PageTitleHeader } from './PageTitleHeader';


export const PageHeader: FC = () => {
  const { data: currentPage } = useSWRxCurrentPage();
  const currentPagePath = currentPage?.path;

  const [editedPagePath, setEditedPagePath] = useState(currentPagePath ?? '');

  const editedPageTitle = nodePath.basename(editedPagePath);

  const onInputChangeForPagePath = useCallback((inputText: string) => {
    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage?.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputText);

    setEditedPagePath(newPagePath);
  }, [currentPage?.path, setEditedPagePath]);

  const onInputChangeForPageTitle = (inputText: string) => {
    setEditedPagePath(inputText);
  };

  if (currentPage == null) {
    return <></>;
  }

  return (
    <>
      <PagePathHeader
        currentPage={currentPage}
        inputValue={editedPagePath}
        onInputChange={onInputChangeForPagePath}
      />
      <PageTitleHeader
        currentPage={currentPage}
        inputValue={editedPageTitle}
        onInputChange={onInputChangeForPageTitle}
      />
    </>
  );
};
