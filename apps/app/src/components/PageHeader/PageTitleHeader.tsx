import type { FC } from 'react';
import { useState, useMemo, useCallback } from 'react';

import nodePath from 'path';

import { pathUtils } from '@growi/core/dist/utils';

import type { Props } from './PagePathHeader';
import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';
import { usePagePathRenameHandler } from './page-header-utils';


export const PageTitleHeader: FC<Props> = (props) => {
  const { currentPage } = props;

  const currentPagePath = currentPage.path;

  const pageTitle = nodePath.basename(currentPagePath) || '/';

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [editedPagePath, setEditedPagePath] = useState(currentPagePath);

  const editedPageTitle = nodePath.basename(editedPagePath);

  const onRenameFinish = () => {
    setRenameInputShown(false);
  };

  const onRenameFailure = () => {
    setRenameInputShown(true);
  };

  const onInputChange = useCallback((inputText: string) => {
    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage?.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputText);

    setEditedPagePath(newPagePath);
  }, [currentPage?.path, setEditedPagePath]);

  const onPressEscape = () => {
    setEditedPagePath(currentPagePath);
    setRenameInputShown(false);
  };

  const onClickPageTitle = () => {
    console.log(currentPagePath);
    setEditedPagePath(currentPagePath);
    setRenameInputShown(true);
  };

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const stateHandler = { isRenameInputShown, setRenameInputShown };

  const PageTitle = useMemo(() => (<div onClick={onClickPageTitle}>{pageTitle}</div>), [pageTitle]);

  const buttonStyle = isRenameInputShown ? '' : 'd-none';

  const onClickButton = () => {
    pagePathRenameHandler(editedPagePath, onRenameFinish, onRenameFailure);
  };

  return (
    <div className="row">
      <div className="col-4">
        <TextInputForPageTitleAndPath
          currentPage={currentPage}
          stateHandler={stateHandler}
          inputValue={editedPageTitle}
          CustomComponent={PageTitle}
          onInputChange={onInputChange}
          onPressEscape={onPressEscape}
        />
      </div>
      <div className={`col-4 ${buttonStyle}`}>
        <button type="button" onClick={onClickButton}>
          <span className="material-symbols-outlined">check_circle</span>
        </button>
      </div>
    </div>
  );
};
