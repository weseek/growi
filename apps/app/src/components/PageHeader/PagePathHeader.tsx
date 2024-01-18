import {
  FC, useEffect, useMemo, useState,
} from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';

import { usePageSelectModal } from '~/stores/modal';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { PagePathNav } from '../Common/PagePathNav';
import { PageSelectModal } from '../PageSelectModal/PageSelectModal';

import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';
import { usePagePathRenameHandler } from './page-header-utils';

type Props = {
  currentPagePath: string
  currentPage: IPagePopulatedToShowRevision
}

export const PagePathHeader: FC<Props> = (props) => {
  const { currentPagePath, currentPage } = props;

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [isButtonsShown, setButtonShown] = useState(false);
  const [inputText, setInputText] = useState('');

  const { data: editorMode } = useEditorMode();
  const { data: PageSelectModalData, open: openPageSelectModal } = usePageSelectModal();

  const onRenameFinish = () => {
    setRenameInputShown(false);
  };

  const onRenameFailure = () => {
    setRenameInputShown(true);
  };

  const pagePathSubmitHandler = usePagePathRenameHandler(currentPage, onRenameFinish, onRenameFailure);

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
    setInputText(inputText);
  };

  const handleEditButtonClick = () => {
    if (isRenameInputShown) {
      pagePathSubmitHandler(inputText);
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
    <>
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
              inputValue={currentPagePath}
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
    </>
  );
};
