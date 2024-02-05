import type { FC } from 'react';
import {
  useState, useMemo,
} from 'react';

import nodePath from 'path';

import { pathUtils } from '@growi/core/dist/utils';

import type { Props } from './PagePathHeader';
import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';
import { usePagePathRenameHandler } from './page-header-utils';


export const PageTitleHeader: FC<Props> = (props) => {
  const { currentPage, editedPagePathState } = props;

  const currentPagePath = currentPage.path;

  const pageTitle = nodePath.basename(currentPagePath ?? '') || '/';

  const [isRenameInputShown, setRenameInputShown] = useState(false);

  const { editedPagePath, setEditedPagePath } = editedPagePathState;

  const editingPageTitle = nodePath.basename(editedPagePath);

  const onRenameFinish = () => {
    setRenameInputShown(false);
  };

  const onRenameFailure = () => {
    setRenameInputShown(true);
  };

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage, onRenameFinish, onRenameFailure);

  const stateHandler = { isRenameInputShown, setRenameInputShown };

  const PageTitle = useMemo(() => (<div onClick={() => setRenameInputShown(true)}>{pageTitle}</div>), [pageTitle]);

  const handleInputChange = (inputText: string) => {
    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputText);

    setEditedPagePath(newPagePath);
  };

  const buttonStyle = isRenameInputShown ? '' : 'd-none';

  const handleButtonClick = () => {
    pagePathRenameHandler(editedPagePath);
  };

  return (
    <div className="row">
      <div className="col-4">
        <TextInputForPageTitleAndPath
          currentPage={currentPage}
          stateHandler={stateHandler}
          editedPagePathState={editedPagePathState}
          inputValue={editingPageTitle}
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
