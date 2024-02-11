import type { FC } from 'react';
import { useState, useCallback } from 'react';

import nodePath from 'path';

import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/input-validator';

import ClosableTextInput from '../Common/ClosableTextInput';
import { CopyDropdown } from '../Common/CopyDropdown';

import type { Props } from './PagePathHeader';
import { usePagePathRenameHandler } from './page-header-utils';


export const PageTitleHeader: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { currentPage } = props;

  const currentPagePath = currentPage.path;

  const pageTitle = nodePath.basename(currentPagePath) || '/';

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [editedPagePath, setEditedPagePath] = useState(currentPagePath);

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const editedPageTitle = nodePath.basename(editedPagePath);

  const onRenameFinish = useCallback(() => {
    setRenameInputShown(false);
  }, []);

  const onRenameFailure = useCallback(() => {
    setRenameInputShown(true);
  }, []);

  const onInputChange = useCallback((inputText: string) => {
    const parentPagePath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage.path));
    const newPagePath = nodePath.resolve(parentPagePath, inputText);

    setEditedPagePath(newPagePath);
  }, [currentPage?.path, setEditedPagePath]);

  const onPressEnter = useCallback(() => {
    pagePathRenameHandler(editedPagePath, onRenameFinish, onRenameFailure);
  }, [editedPagePath, onRenameFailure, onRenameFinish, pagePathRenameHandler]);

  const onPressEscape = useCallback(() => {
    setEditedPagePath(currentPagePath);
    setRenameInputShown(false);
  }, [currentPagePath]);

  const onClickPageTitle = useCallback(() => {
    setEditedPagePath(currentPagePath);
    setRenameInputShown(true);
  }, [currentPagePath]);


  return (
    <div className="d-flex">
      <div className="me-1">
        {isRenameInputShown
          ? (
            <div className="page-title-header-input">
              <ClosableTextInput
                useAutosizeInput
                value={editedPageTitle}
                placeholder={t('Input page name')}
                onPressEnter={onPressEnter}
                onPressEscape={onPressEscape}
                onChange={onInputChange}
                onClickOutside={() => setRenameInputShown(false)}
                validationTarget={ValidationTarget.PAGE}
              />
            </div>
          )
          : (
            <h2 onClick={onClickPageTitle}>
              {pageTitle}
            </h2>
          )}
      </div>

      <CopyDropdown
        pageId={currentPage._id}
        pagePath={currentPage.path}
        dropdownToggleId={`copydropdown-${currentPage._id}`}
        dropdownToggleClassName="p-2"
      >
        <span className="material-symbols-outlined fs-5">content_paste</span>
      </CopyDropdown>
    </div>
  );
};
