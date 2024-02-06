import { useCallback } from 'react';
import type { Dispatch, SetStateAction, FC } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/input-validator';

import ClosableTextInput from '../Common/ClosableTextInput';

import { usePagePathRenameHandler } from './page-header-utils';

export type editedPagePathState = {
  editedPagePath: string
  setEditedPagePath: Dispatch<SetStateAction<string>>
}

type StateHandler = {
  isRenameInputShown: boolean
  setRenameInputShown: Dispatch<SetStateAction<boolean>>
}

type Props = {
  currentPage: IPagePopulatedToShowRevision
  stateHandler: StateHandler
  inputValue: string
  CustomComponent: JSX.Element
  onInputChange?: (string) => void
  onPressEscape?: () => void
}

export const TextInputForPageTitleAndPath: FC<Props> = (props) => {
  const {
    currentPage, stateHandler, inputValue, CustomComponent, onInputChange,
  } = props;

  const { t } = useTranslation();

  const { isRenameInputShown, setRenameInputShown } = stateHandler;

  const onRenameFinish = () => {
    setRenameInputShown(false);
  };

  const onRenameFailure = () => {
    setRenameInputShown(true);
  };

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage, onRenameFinish, onRenameFailure);

  const onPressEnter = useCallback(() => {
    pagePathRenameHandler(editedPagePath);
  }, [editedPagePath, pagePathRenameHandler]);

  // const onPressEscape = useCallback(() => {
  //   setEditedPagePath(currentPage.path);
  //   setRenameInputShown(false);
  // }, [currentPage.path, setEditedPagePath, setRenameInputShown]);

  return (
    <>
      {isRenameInputShown ? (
        <div className="flex-fill">
          <ClosableTextInput
            value={inputValue}
            placeholder={t('Input page name')}
            onPressEnter={onPressEnter}
            onPressEscape={props.onPressEscape}
            validationTarget={ValidationTarget.PAGE}
            handleInputChange={onInputChange}
          />
        </div>
      ) : (
        <>{ CustomComponent }</>
      )}
    </>
  );
};
