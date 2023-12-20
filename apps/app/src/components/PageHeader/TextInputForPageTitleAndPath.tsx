import { FC } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/input-validator';

import ClosableTextInput from '../Common/ClosableTextInput';

import { usePagePathSubmitHandler } from './page-header-utils';

type StateHandler = {
  isRenameInputShown: boolean
  setRenameInputShown: Dispatch<SetStateAction<boolean>>
}

type Props = {
  currentPagePath: string
  currentPage: IPagePopulatedToShowRevision
  stateHandler: StateHandler
  inputValue: string
  CustomComponent: JSX.Element
  handleInputChange?: (string) => void
}

export const TextInputForPageTitleAndPath: FC<Props> = (props) => {
  const {
    currentPagePath, currentPage, stateHandler, inputValue, CustomComponent, handleInputChange,
  } = props;

  const { t } = useTranslation();

  const { isRenameInputShown, setRenameInputShown } = stateHandler;

  const pagePathSubmitHandler = usePagePathSubmitHandler(currentPage, currentPagePath, setRenameInputShown);

  return (
    <>
      {isRenameInputShown ? (
        <div className="flex-fill">
          <ClosableTextInput
            value={inputValue}
            placeholder={t('Input page name')}
            onClickOutside={() => { setRenameInputShown(false) }}
            onPressEnter={pagePathSubmitHandler}
            validationTarget={ValidationTarget.PAGE}
            handleInputChange={handleInputChange}
          />
        </div>
      ) : (
        { CustomComponent }
      )}
    </>
  );
};
