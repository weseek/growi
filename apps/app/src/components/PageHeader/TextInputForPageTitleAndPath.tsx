import { FC, useCallback } from 'react';

import nodePath from 'path';

import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { ValidationTarget } from '~/client/util/input-validator';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useSWRMUTxCurrentPage } from '~/stores/page';
import { mutatePageTree, mutatePageList } from '~/stores/page-listing';
import { mutateSearching } from '~/stores/search';

import ClosableTextInput from '../Common/ClosableTextInput';


type Props = {
  currentPagePath
  currentPage
  stateHandler
  inputValue
  CustomComponent
}

export const TextInputForPageTitleAndPath: FC<Props> = (props) => {
  const {
    currentPagePath, currentPage, stateHandler, inputValue, CustomComponent,
  } = props;

  const { t } = useTranslation();


  const { isRenameInputShown, setRenameInputShown } = stateHandler;

  return (
    <>
      {isRenameInputShown ? (
        <div className="flex-fill">
          <ClosableTextInput
            value={inputValue}
            placeholder={t('Input page name')}
            onClickOutside={() => { setRenameInputShown(false) }}
            // onPressEnter={onPressEnterForRenameHandler}
            validationTarget={ValidationTarget.PAGE}
          />
        </div>
      ) : (
        <CustomComponent />
      )}
    </>
  );
};
