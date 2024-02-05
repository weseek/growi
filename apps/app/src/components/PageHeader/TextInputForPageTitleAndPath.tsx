import { useCallback } from 'react';
import type { Dispatch, SetStateAction, FC } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
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

  const onRenameFinish = () => {
    setRenameInputShown(false);
  };

  const onRenameFailure = () => {
    setRenameInputShown(true);
  };

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage, onRenameFinish, onRenameFailure);

  const onPressEnter = useCallback(() => {
    pagePathRenameHandler(editingPagePath);
  }, [editingPagePath, pagePathRenameHandler]);

  const onPressEscape = useCallback(() => {
    setEditingPagePath(currentPage.path);
    setRenameInputShown(false);
  }, [currentPage.path, setEditingPagePath, setRenameInputShown]);

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
