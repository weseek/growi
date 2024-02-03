import type { FC } from 'react';
import { useState, useMemo } from 'react';

import nodePath from 'path';

import type { IPagePopulatedToShowRevision } from '@growi/core';

import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';

type Props = {
  currentPagePath: string,
  currentPage: IPagePopulatedToShowRevision;
}


export const PageTitleHeader: FC<Props> = (props) => {
  const { currentPagePath, currentPage } = props;
  const pageName = nodePath.basename(currentPagePath ?? '') || '/';

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [inputText, setInputText] = useState(pageName);


  const stateHandler = { isRenameInputShown, setRenameInputShown };

  const PageTitle = useMemo(() => (<div onClick={() => setRenameInputShown(true)}>{pageName}</div>), [pageName]);

  const handleInputChange = (inputText: string) => {
    if (inputText !== '') {
      setInputText(inputText);
    }
    else {
      setInputText(pageName);
    }
  };

  return (
    <div onBlur={() => setRenameInputShown(false)}>
      <TextInputForPageTitleAndPath
        currentPage={currentPage}
        stateHandler={stateHandler}
        inputValue={inputText}
        CustomComponent={PageTitle}
        handleInputChange={handleInputChange}
      />
    </div>
  );
};
