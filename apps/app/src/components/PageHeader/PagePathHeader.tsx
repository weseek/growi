import { useMemo, useState, useEffect } from 'react';
import type { FC } from 'react';

import nodePath from 'path';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { pathUtils } from '@growi/core/dist/utils';

import { usePageSelectModal } from '~/stores/modal';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { PagePathNav } from '../Common/PagePathNav';
import { PageSelectModal } from '../PageSelectModal/PageSelectModal';

import type { editedPagePathState } from './TextInputForPageTitleAndPath';
import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';
import { usePagePathRenameHandler } from './page-header-utils';


export type Props = {
  currentPage: IPagePopulatedToShowRevision
  editedPagePathState: editedPagePathState
}

export const PagePathHeader: FC<Props> = (props) => {
  const { currentPage, editedPagePathState } = props;

  const currentPagePath = currentPage.path;

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [isButtonsShown, setButtonShown] = useState(false);

  const { data: editorMode } = useEditorMode();
  const { data: PageSelectModalData, open: openPageSelectModal } = usePageSelectModal();

  const { editedPagePath, setEditedPagePath } = editedPagePathState;

  const pageTitle = nodePath.basename(currentPagePath ?? '') || '/';
  const parentPagePath = pathUtils.addHeadingSlash(nodePath.dirname(currentPage.path ?? ''));

  const onRenameFinish = () => {
    setRenameInputShown(false);
  };

  const onRenameFailure = () => {
    setRenameInputShown(true);
  };

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage, onRenameFinish, onRenameFailure);

  const stateHandler = { isRenameInputShown, setRenameInputShown };

  const isOpened = PageSelectModalData?.isOpened ?? false;

  const isViewMode = editorMode === EditorMode.View;
  const isEditorMode = !isViewMode;

  const PagePath = useMemo(() => (
    <PagePathNav
      pageId={currentPage._id}
      pagePath={currentPagePath}
      isSingleLineMode={isEditorMode}
    />
  ), [currentPage._id, currentPagePath, isEditorMode]);

  const handleInputChange = (inputText: string) => {
    const editingParentPagePath = inputText;
    const newPagePath = nodePath.resolve(editingParentPagePath, pageTitle);
    setEditedPagePath(newPagePath);
  };

  const handleEditButtonClick = () => {
    if (isRenameInputShown) {
      pagePathRenameHandler(editedPagePath);
    }
    else {
      setRenameInputShown(true);
    }
  };

  const buttonStyle = isButtonsShown ? '' : 'd-none';

  const clickOutSideHandler = (e) => {
    const container = document.getElementById('page-path-header');

    if (container && !container.contains(e.target)) {
      setRenameInputShown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', clickOutSideHandler);

    return () => {
      document.removeEventListener('click', clickOutSideHandler);
    };
  }, []);

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
            editedPagePathState={editedPagePathState}
            inputValue={editedPagePath}
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
