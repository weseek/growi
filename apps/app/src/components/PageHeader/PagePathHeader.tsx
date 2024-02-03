import type { FC, Dispatch, SetStateAction } from 'react';
import { useEffect, useMemo, useState } from 'react';

import nodePath from 'path';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { pathUtils } from '@growi/core/dist/utils';

import { usePageSelectModal } from '~/stores/modal';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { PagePathNav } from '../Common/PagePathNav';
import { PageSelectModal } from '../PageSelectModal/PageSelectModal';

import { TextInputForPageTitleAndPath, type editingPagePathHandler } from './TextInputForPageTitleAndPath';
import { usePagePathRenameHandler } from './page-header-utils';

export type Props = {
  currentPagePath: string
  currentPage: IPagePopulatedToShowRevision
  editingPagePathHandler: editingPagePathHandler
}

export const PagePathHeader: FC<Props> = (props) => {
  const { currentPagePath, currentPage, editingPagePathHandler } = props;

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [isButtonsShown, setButtonShown] = useState(false);

  const { data: editorMode } = useEditorMode();
  const { data: PageSelectModalData, open: openPageSelectModal } = usePageSelectModal();

  const { editingPagePath, setEditingPagePath } = editingPagePathHandler;

  const onRenameFinish = () => {
    setRenameInputShown(false);
  };

  const onRenameFailure = () => {
    setRenameInputShown(true);
  };

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const stateHandler = { isRenameInputShown, setRenameInputShown };

  const isOpened = PageSelectModalData?.isOpened ?? false;

  const isViewMode = editorMode === EditorMode.View;
  const isEditorMode = !isViewMode;

  const PagePath = useMemo(() => (
    <>
      {currentPagePath != null && (
        <PagePathNav
          pageId={currentPage._id}
          pagePath={currentPagePath}
          isSingleLineMode={isEditorMode}
        />
      )}
    </>
  ), [currentPage._id, currentPagePath, isEditorMode]);

  const handleInputChange = (inputText: string) => {
    setEditingPagePath(inputText);
  };

  const handleEditButtonClick = () => {
    if (isRenameInputShown) {
      pagePathRenameHandler(editingPagePath);
    }
    else {
      setRenameInputShown(true);
    }
  };

  const buttonStyle = isButtonsShown ? '' : 'd-none';

  // const clickOutSideHandler = (e) => {
  //   const container = document.getElementById('page-path-header');

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
      id="page-path-header"
      onMouseLeave={() => setButtonShown(false)}
    >
      <div className="row">
        <div
          className="col-4"
          onMouseEnter={() => setButtonShown(true)}
        >
          <TextInputForPageTitleAndPath
            currentPage={currentPage}
            stateHandler={stateHandler}
            editingPagePathHandler={editingPagePathHandler}
            inputValue={editingPagePath}
            CustomComponent={PagePath}
            handleInputChange={handleInputChange}
          />
        </div>
        <div className={`${buttonStyle} col-4 row`}>
          <div className="col-4">
            <button type="button" onClick={handleEditButtonClick}>
              {isRenameInputShown ? <span className="material-symbols-outlined">check_circle</span> : <span className="material-symbols-outlined">edit</span>}
            </button>
          </div>
          <div className="col-4">
            <button type="button" onClick={openPageSelectModal}>
              <span className="material-symbols-outlined">account_tree</span>
            </button>
          </div>
        </div>
        {isOpened
          && (
            <PageSelectModal />
          )}
      </div>
    </div>
  );
};
