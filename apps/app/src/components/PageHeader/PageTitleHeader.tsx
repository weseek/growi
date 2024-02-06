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

  const onRenameFinish = () => {
    setRenameInputShown(false);
  };

  const onRenameFailure = () => {
    setRenameInputShown(true);
  };

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage, onRenameFinish, onRenameFailure);

  const stateHandler = { isRenameInputShown, setRenameInputShown };

  const PageTitle = useMemo(() => (<div onClick={() => setRenameInputShown(true)}>{pageTitle}</div>), [pageTitle]);

  const buttonStyle = isRenameInputShown ? '' : 'd-none';

  const onClickButton = () => {
    pagePathRenameHandler(props.inputValue);
  };

  return (
    <div className="row">
      <div className="col-4">
        <TextInputForPageTitleAndPath
          currentPage={currentPage}
          stateHandler={stateHandler}
          inputValue={props.inputValue}
          CustomComponent={PageTitle}
          onInputChange={props.onInputChange}
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
