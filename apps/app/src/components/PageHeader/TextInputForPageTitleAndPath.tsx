import { useCallback, useEffect } from 'react';
import type { Dispatch, SetStateAction, FC } from 'react';

import nodePath from 'path';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/input-validator';

import ClosableTextInput from '../Common/ClosableTextInput';


import { usePagePathRenameHandler } from './page-header-utils';


export type editingPagePathHandler = {
  editingPagePath: string
  setEditingPagePath: Dispatch<SetStateAction<string>>
}

type StateHandler = {
  isRenameInputShown: boolean
  setRenameInputShown: Dispatch<SetStateAction<boolean>>
}

type Props = {
  currentPage: IPagePopulatedToShowRevision
  stateHandler: StateHandler
  editingPagePathHandler: editingPagePathHandler
  inputValue: string
  CustomComponent: JSX.Element
  handleInputChange?: (string) => void
}

export const TextInputForPageTitleAndPath: FC<Props> = (props) => {
  const {
    currentPage, stateHandler, inputValue, CustomComponent, handleInputChange, editingPagePathHandler,
  } = props;

  const { t } = useTranslation();

  const { isRenameInputShown, setRenameInputShown } = stateHandler;
  const { editingPagePath, setEditingPagePath } = editingPagePathHandler;


  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const onPressEnter = useCallback((inputPagePath: string) => {

    const onRenameFinish = () => {
      setRenameInputShown(false);
    };

    const onRenameFailure = () => {
      setRenameInputShown(true);
    };

    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputPagePath);

    pagePathRenameHandler(newPagePath, onRenameFinish, onRenameFailure);

  }, [currentPage.path, pagePathRenameHandler, setRenameInputShown]);

  const onPressEscape = useCallback(() => {
    setEditingPagePath(currentPage.path);
    setRenameInputShown(false);
  }, [currentPage.path, setEditingPagePath, setRenameInputShown]);

  useEffect(() => {
    const onClickOutsideHandler = (e) => {
      const pageHeaderElement = document.getElementById('page-header');

      if (pageHeaderElement && !pageHeaderElement.contains(e.target)) {
        pagePathRenameHandler(editingPagePath);
        console.log('clicked outside');
      }
    };

    document.addEventListener('click', onClickOutsideHandler);

    return () => document.removeEventListener('click', onClickOutsideHandler);
  }, [editingPagePath, pagePathRenameHandler]);

  return (
    <>
      {isRenameInputShown ? (
        <div className="flex-fill">
          <ClosableTextInput
            value={inputValue}
            placeholder={t('Input page name')}
            onPressEnter={onPressEnter}
            onPressEscape={onPressEscape}
            validationTarget={ValidationTarget.PAGE}
            handleInputChange={handleInputChange}
          />
        </div>
      ) : (
        <>{ CustomComponent }</>
      )}
    </>
  );
};
