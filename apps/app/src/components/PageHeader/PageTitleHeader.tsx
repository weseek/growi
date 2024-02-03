import type { FC } from 'react';
import {
  useState, useMemo, useEffect, useRef,
} from 'react';

import nodePath from 'path';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { pathUtils } from '@growi/core/dist/utils';

import type { Props } from './PagePathHeader';
import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';
import { usePagePathRenameHandler } from './page-header-utils';


export const PageTitleHeader: FC<Props> = (props) => {
  const { currentPagePath, currentPage, editingPagePathHandler } = props;
  const pageTitle = nodePath.basename(currentPagePath ?? '') || '/';

  const [isRenameInputShown, setRenameInputShown] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const { editingPagePath, setEditingPagePath } = editingPagePathHandler;

  const editingPageTitle = nodePath.basename(editingPagePath);

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

    setEditingPagePath(newPagePath);
  };

  const onBlurHandler = () => {
    pagePathRenameHandler(editingPagePath);
  };

  const buttonStyle = isRenameInputShown ? '' : 'd-none';

  const handleButtonClick = () => {
    pagePathRenameHandler(editingPagePath);
  };

  // useEffect(() => {
  //   const element = ref.current;

  //   if (element == null) {
  //     return;
  //   }

  //   const handleClickOutside = (e) => {
  //     if (!element.contains(e.target)) {
  //       pagePathRenameHandler(editingPagePath);
  //     }
  //   };

  //   document.addEventListener('click', handleClickOutside);

  //   return () => {
  //     document.removeEventListener('click', handleClickOutside);
  //   };

  // }, []);

  // const clickOutSideHandler = (e) => {
  //   const container = document.getElementById('page-title-header');

  //   if (container && !container.contains(e.target)) {
  //     pagePathRenameHandler(editingPagePath);
  //     console.log('click outside');
  //   }
  // };

  // useEffect(() => {
  //   document.addEventListener('click', clickOutSideHandler);

  //   return () => {
  //     document.removeEventListener('click', clickOutSideHandler);
  //   };
  // }, []);

  return (
    <div
      className="row"
      // onBlur={onBlurHandler}
      ref={ref}
    >
      <div className="col-4">
        <TextInputForPageTitleAndPath
          currentPage={currentPage}
          stateHandler={stateHandler}
          editingPagePathHandler={editingPagePathHandler}
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
