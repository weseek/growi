import type { FC } from 'react';
import { useState, useCallback } from 'react';

import nodePath from 'path';

import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/input-validator';

import ClosableTextInput from '../Common/ClosableTextInput';

import type { Props } from './PagePathHeader';
import { usePagePathRenameHandler } from './page-header-utils';


export const PageTitleHeader: FC<Props> = (props) => {
  const { currentPage } = props;

  const currentPagePath = currentPage.path;

  const pageTitle = nodePath.basename(currentPagePath) || '/';

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [editedPagePath, setEditedPagePath] = useState(currentPagePath);

  const { t } = useTranslation();

  const editedPageTitle = nodePath.basename(editedPagePath);

  const onRenameFinish = () => {
    setRenameInputShown(false);
  };

  const onRenameFailure = () => {
    setRenameInputShown(true);
  };

  const onInputChange = useCallback((inputText: string) => {
    const parentPagePath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage?.path ?? ''));
    const newPagePath = nodePath.resolve(parentPagePath, inputText);

    setEditedPagePath(newPagePath);
  }, [currentPage?.path, setEditedPagePath]);

  const onPressEscape = () => {
    setEditedPagePath(currentPagePath);
    setRenameInputShown(false);
  };

  const onClickPageTitle = () => {
    setEditedPagePath(currentPagePath);
    setRenameInputShown(true);
  };

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const PageTitle = <div onClick={onClickPageTitle}>{pageTitle}</div>;

  const buttonStyle = isRenameInputShown ? '' : 'd-none';

  const onClickButton = () => {
    pagePathRenameHandler(editedPagePath, onRenameFinish, onRenameFailure);
  };

  const onPressEnter = () => {
    pagePathRenameHandler(editedPagePath, onRenameFinish, onRenameFailure);
  };

  return (
    <div className="row">
      <div className="col-4">
        {isRenameInputShown ? (
          <div className="flex-fill">
            <ClosableTextInput
              value={editedPageTitle}
              placeholder={t('Input page name')}
              onPressEnter={onPressEnter}
              onPressEscape={onPressEscape}
              validationTarget={ValidationTarget.PAGE}
              handleInputChange={onInputChange}
            />
          </div>
        ) : (
          <>{ PageTitle }</>
        )}
      </div>
      <div className={`col-4 ${buttonStyle}`}>
        <button type="button" onClick={onClickButton}>
          <span className="material-symbols-outlined">check_circle</span>
        </button>
      </div>
    </div>
  );
};
