import {
  useMemo, useState, useEffect, useCallback,
} from 'react';
import type { FC } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';

import { usePageSelectModal } from '~/stores/modal';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { PagePathNav } from '../Common/PagePathNav';
import { PageSelectModal } from '../PageSelectModal/PageSelectModal';

import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';
import { usePagePathRenameHandler } from './page-header-utils';


export type Props = {
  currentPage: IPagePopulatedToShowRevision
  inputValue: string
  onInputChange?: (inputText: string) => void
}

export const PagePathHeader: FC<Props> = (props) => {
  const { currentPage } = props;

  const currentPagePath = currentPage.path;

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [isButtonsShown, setButtonShown] = useState(false);

  const { data: editorMode } = useEditorMode();
  const { data: PageSelectModalData, open: openPageSelectModal } = usePageSelectModal();

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

  const onClickEditButton = useCallback(() => {
    if (isRenameInputShown) {
      pagePathRenameHandler(props.inputValue);
    }
    else {
      setRenameInputShown(true);
    }
  }, [isRenameInputShown, pagePathRenameHandler, props.inputValue]);

  const buttonStyle = isButtonsShown ? '' : 'd-none';

  const clickOutSideHandler = useCallback((e) => {
    const container = document.getElementById('page-path-header');

    if (container && !container.contains(e.target)) {
      setRenameInputShown(false);
    }
  }, []);

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
            inputValue={props.inputValue}
            CustomComponent={PagePath}
            onInputChange={props.onInputChange}
          />
        </div>
        <div className={`${buttonStyle} col-4 row`}>
          <div className="col-4">
            <button type="button" onClick={onClickEditButton}>
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
