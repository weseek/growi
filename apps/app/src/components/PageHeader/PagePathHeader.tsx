import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/input-validator';
import { usePageSelectModal } from '~/stores/modal';

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

  const { data: PageSelectModalData, open: openPageSelectModal } = usePageSelectModal();

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const { t } = useTranslation();

  const onRenameFinish = useCallback(() => {
    setRenameInputShown(false);
  }, []);

  const onRenameFailure = useCallback(() => {
    setRenameInputShown(true);
  }, []);

  const onInputChange = useCallback((inputText: string) => {
    setEditedPagePath(inputText);
  }, []);

  const onPressEnter = useCallback(() => {
    pagePathRenameHandler(editedPagePath, onRenameFinish, onRenameFailure);
  }, [editedPagePath, onRenameFailure, onRenameFinish, pagePathRenameHandler]);

  const onPressEscape = useCallback(() => {
    setEditedPagePath(currentPagePath);
    setRenameInputShown(false);
  }, [currentPagePath]);

  const onClickEditButton = useCallback(() => {
    if (isRenameInputShown) {
      pagePathRenameHandler(editedPagePath, onRenameFinish, onRenameFailure);
    }
    else {
      setEditedPagePath(currentPagePath);
      setRenameInputShown(true);
    }
  }, [currentPagePath, editedPagePath, isRenameInputShown, onRenameFailure, onRenameFinish, pagePathRenameHandler]);

  const isOpened = PageSelectModalData?.isOpened ?? false;

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
  }, [clickOutSideHandler]);


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
          {isRenameInputShown
            ? (
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
              <div className="">
                <PagePathNav
                  pageId={currentPage._id}
                  pagePath={currentPagePath}
                  isSingleLineMode
                />
              </div>
            )}
        </div>

        <div className={`${isButtonsShown ? '' : 'd-none'} col-4 row`}>
          <div className="d-flex align-items-center">
            <button type="button" className="btn btn-sm btn-link text-muted border border-secondary me-2" onClick={onClickEditButton}>
              <span className="material-symbols-outlined fs-5">{isRenameInputShown ? 'check_circle' : 'edit'}</span>
            </button>
            <button type="button" className="btn btn-sm btn-link text-muted border border-secondary" onClick={openPageSelectModal}>
              <span className="material-symbols-outlined fs-5">account_tree</span>
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
