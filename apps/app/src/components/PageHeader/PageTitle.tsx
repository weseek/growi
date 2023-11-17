import { FC, useState } from 'react';

import nodePath from 'path';

import type { IPagePopulatedToShowRevision } from '@growi/core';

import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';

type Props = {
  currentPagePath: string,
  currentPage: IPagePopulatedToShowRevision;
}

export const PageTitle: FC<Props> = (props) => {
  const { currentPagePath, currentPage } = props;

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const pageName = nodePath.basename(currentPagePath ?? '') || '/';

  const stateHandler = { isRenameInputShown, setRenameInputShown };

  return (
    <TextInputForPageTitleAndPath
      currentPagePath={currentPagePath}
      currentPage={currentPage}
      stateHandler={stateHandler}
      inputValue={pageName}
    />
  );
};
