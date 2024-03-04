import type { FC } from 'react';
import { useState, useCallback, useEffect } from 'react';

import nodePath from 'path';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { DevidedPagePath } from '@growi/core/dist/models';
import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/input-validator';
import { basePathname } from '~/server/routes/apiv3/page/create-page';

import ClosableTextInput from '../Common/ClosableTextInput';
import { CopyDropdown } from '../Common/CopyDropdown';
import { usePagePathRenameHandler } from '../PageEditor/page-path-rename-utils';


import styles from './PageTitleHeader.module.scss';

const moduleClass = styles['page-title-header'];

type Props = {
  currentPage: IPagePopulatedToShowRevision,
  className?: string,
};

export const PageTitleHeader: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { currentPage } = props;

  const currentPagePath = currentPage.path;

  const dPagePath = new DevidedPagePath(currentPage.path, true);
  const pageTitle = dPagePath.latter;

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [editedPagePath, setEditedPagePath] = useState(currentPagePath);

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const editedPageTitle = nodePath.basename(editedPagePath);

  // https://regex101.com/r/Wg2Hh6/1
  // const untitledPageRegex = /^Untitled-\d+$/;

  const untitledPageRegex = new RegExp(`/^${basePathname}-\d+$/`);

  const isNewlyCreatedPage = (currentPage.wip && currentPage.latestRevision == null && untitledPageRegex.test(editedPageTitle)) ?? false;

  const onRenameFinish = useCallback(() => {
    setRenameInputShown(false);
  }, []);

  const onRenameFailure = useCallback(() => {
    setRenameInputShown(true);
  }, []);

  const onInputChange = useCallback((inputText: string) => {
    const newPageTitle = pathUtils.removeHeadingSlash(inputText);
    const parentPagePath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage.path));
    const newPagePath = nodePath.resolve(parentPagePath, newPageTitle);

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

  useEffect(() => {
    if (isNewlyCreatedPage) {
      setRenameInputShown(true);
    }
  }, [currentPage._id, isNewlyCreatedPage]);

  return (
    <div className={`d-flex align-items-center ${moduleClass} ${props.className ?? ''}`}>
      <div className="me-1">
        { isRenameInputShown && (
          <div className="position-absolute">
            <ClosableTextInput
              useAutosizeInput
              value={isNewlyCreatedPage ? '' : editedPageTitle}
              placeholder={t('Input page name')}
              inputClassName="fs-4"
              onPressEnter={onPressEnter}
              onPressEscape={onPressEscape}
              onChange={onInputChange}
              onClickOutside={() => { setRenameInputShown(false) }}
              validationTarget={ValidationTarget.PAGE}
            />
          </div>
        ) }
        <h1 className={`mb-0 fs-4 ${isRenameInputShown ? 'invisible' : ''}`} onClick={onClickPageTitle}>
          {pageTitle}
        </h1>
      </div>

      <div className={`${isRenameInputShown ? 'invisible' : ''} d-flex align-items-center`}>
        { currentPage.wip && (
          <span className="badge rounded-pill text-bg-secondary ms-2">WIP</span>
        )}

        <CopyDropdown
          pageId={currentPage._id}
          pagePath={currentPage.path}
          dropdownToggleId={`copydropdown-${currentPage._id}`}
          dropdownToggleClassName="ms-2 p-1"
        >
          <span className="material-symbols-outlined fs-6">content_paste</span>
        </CopyDropdown>
      </div>
    </div>
  );
};
