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
}

export const TextInputForPageTitleAndPath: FC<Props> = (props) => {
  const {
    currentPagePath, currentPage, stateHandler, inputValue,
  } = props;

  const { t } = useTranslation();

  const { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage();

  const { isRenameInputShown, setRenameInputShown } = stateHandler;

  const onClickInputValueHandler = () => {
    setRenameInputShown(true);
  };

  const page = currentPage;

  const onRenamed = useCallback((fromPath: string | undefined, toPath: string) => {
    mutatePageTree();
    mutateSearching();
    mutatePageList();

    if (currentPagePath === fromPath || currentPagePath === toPath) {
      mutateCurrentPage();
    }
  }, [currentPagePath, mutateCurrentPage]);

  if (currentPage == null) {
    return <></>;
  }

  const onPressEnterForRenameHandler = async(inputText: string) => {
    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(page.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputText);

    if (newPagePath === page.path) {
      setRenameInputShown(false);
      return;
    }

    try {
      setRenameInputShown(false);
      await apiv3Put('/pages/rename', {
        pageId: page._id,
        revisionId: page.revision._id,
        newPagePath,
      });

      if (onRenamed != null) {
        onRenamed(page.path, newPagePath);
      }

      toastSuccess(t('renamed_pages', { path: page.path }));
    }
    catch (err) {
      setRenameInputShown(true);
      toastError(err);
    }
  };

  return (
    <>
      {isRenameInputShown ? (
        <div className="flex-fill">
          <ClosableTextInput
            value={inputValue}
            placeholder={t('Input page name')}
            onClickOutside={() => { setRenameInputShown(false) }}
            onPressEnter={onPressEnterForRenameHandler}
            validationTarget={ValidationTarget.PAGE}
          />
        </div>
      ) : (
        <div onClick={onClickInputValueHandler}>{inputValue}</div>
      )}
    </>
  );
};
