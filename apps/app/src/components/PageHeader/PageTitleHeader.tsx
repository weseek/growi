import { FC, useState, useCallback } from 'react';

import nodePath from 'path';

import type { IPagePopulatedToShowRevision } from '@growi/core';

import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';

type Props = {
  currentPagePath: string,
  currentPage: IPagePopulatedToShowRevision;
}


export const PageTitleHeader: FC<Props> = (props) => {
  const { currentPagePath, currentPage } = props;

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const pageName = nodePath.basename(currentPagePath ?? '') || '/';

  const stateHandler = { isRenameInputShown, setRenameInputShown };

  const PageTitle = useCallback(() => {
    return (
      <div onClick={() => setRenameInputShown(true)}>{pageName}</div>
    );
  }, [pageName]);

  return (
    <TextInputForPageTitleAndPath
      currentPagePath={currentPagePath}
      currentPage={currentPage}
      stateHandler={stateHandler}
      inputValue={pageName}
      CustomComponent={PageTitle}
    />
  );
};
