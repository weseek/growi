import {
  useMemo, useState, useEffect, useCallback,
} from 'react';
import type { FC } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/input-validator';
import { usePageSelectModal } from '~/stores/modal';
import { EditorMode, useEditorMode } from '~/stores/ui';

import ClosableTextInput from '../Common/ClosableTextInput';
import { PagePathNav } from '../Common/PagePathNav';
import { PageSelectModal } from '../PageSelectModal/PageSelectModal';

import { usePagePathRenameHandler } from './page-header-utils';


export type Props = {
  currentPage: IPagePopulatedToShowRevision
}

export const PagePathHeader: FC<Props> = (props) => {
  const { currentPage } = props;

  const currentPagePath = currentPage.path;

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [isButtonsShown, setButtonShown] = useState(false);
  const [editedPagePath, setEditedPagePath] = useState(currentPagePath);

  const { data: editorMode } = useEditorMode();
  const { data: PageSelectModalData, open: openPageSelectModal } = usePageSelectModal();

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const { t } = useTranslation();

  const onRenameFinish = () => {
    setRenameInputShown(false);
  };

  const onRenameFailure = () => {
    setRenameInputShown(true);
  };

  const onInputChange = (inputText: string) => {
    setEditedPagePath(inputText);
  };

  const onPressEnter = () => {
    pagePathRenameHandler(editedPagePath, onRenameFinish, onRenameFailure);
  };

  const onPressEscape = () => {
    setEditedPagePath(currentPagePath);
    setRenameInputShown(false);
  };

  const onClickEditButton = useCallback(() => {
    if (isRenameInputShown) {
      pagePathRenameHandler(editedPagePath, onRenameFinish, onRenameFailure);
    }
    else {
      setEditedPagePath(currentPagePath);
      setRenameInputShown(true);
    }
  }, [currentPagePath, editedPagePath, isRenameInputShown, pagePathRenameHandler]);

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
          {isRenameInputShown ? (
            <div className="flex-fill">
              <ClosableTextInput
                value={editedPagePath}
                placeholder={t('Input page name')}
                onPressEnter={onPressEnter}
                onPressEscape={onPressEscape}
                validationTarget={ValidationTarget.PAGE}
                handleInputChange={onInputChange}
              />
            </div>
          ) : (
            <>{ PagePath }</>
          )}
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
