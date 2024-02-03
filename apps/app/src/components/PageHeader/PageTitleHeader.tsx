import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';

import nodePath from 'path';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { pathUtils } from '@growi/core/dist/utils';

import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';
import { usePagePathRenameHandler } from './page-header-utils';

type Props = {
  currentPagePath: string,
  currentPage: IPagePopulatedToShowRevision;
}


export const PageTitleHeader: FC<Props> = (props) => {
  const { currentPagePath, currentPage } = props;
  const pageName = nodePath.basename(currentPagePath ?? '') || '/';

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [inputText, setInputText] = useState(pageName);

  const onRenameFinish = () => {
    setRenameInputShown(false);
  };

  const onRenameFailure = () => {
    setRenameInputShown(true);
  };

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage, onRenameFinish, onRenameFailure);

  const stateHandler = { isRenameInputShown, setRenameInputShown };

  const PageTitle = useMemo(() => (<div onClick={() => setRenameInputShown(true)}>{pageName}</div>), [pageName]);

  const handleInputChange = (inputText: string) => {
    setInputText(inputText);
  };

  const onBlurHandler = () => {
    pagePathRenameHandler(inputText);
  };

  const buttonStyle = isRenameInputShown ? '' : 'd-none';

  const handleButtonClick = () => {
    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputText);

    pagePathRenameHandler(newPagePath);
  };

  return (
    <div
      className="row"
      onBlur={onBlurHandler}
    >
      <div className="col-4">
        <TextInputForPageTitleAndPath
          currentPage={currentPage}
          stateHandler={stateHandler}
          inputValue={inputText}
          CustomComponent={PageTitle}
          handleInputChange={handleInputChange}
        />
      </div>
      <div className={`col-4 ${buttonStyle}`}>
        <button type="button" onClick={handleButtonClick}>
          <span className="material-symbols-outlined">check_circle</span>
        </button>
      </div>
    </div>
  );
};
