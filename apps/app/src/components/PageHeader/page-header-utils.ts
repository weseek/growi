import type { Dispatch, SetStateAction } from 'react';

import nodePath from 'path';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useSWRMUTxCurrentPage } from '~/stores/page';
import { mutatePageTree, mutatePageList } from '~/stores/page-listing';
import { mutateSearching } from '~/stores/search';

export const usePagePathSubmitHandler = (
    currentPage: IPagePopulatedToShowRevision, currentPagePath: string, setRenameInputShown: Dispatch<SetStateAction<boolean>>,
): (inputText: string) => Promise<void> => {

  const { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage();
  const { t } = useTranslation();

  const onRenamed = (fromPath: string | undefined, toPath: string) => {
    mutatePageTree();
    mutateSearching();
    mutatePageList();

    if (currentPagePath === fromPath || currentPagePath === toPath) {
      mutateCurrentPage();
    }
  };

  const pagePathSubmitHandler = async(inputText: string) => {

    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputText);

    if (newPagePath === currentPage.path) {
      setRenameInputShown(false);
      return;
    }

    try {
      setRenameInputShown(false);
      await apiv3Put('/pages/rename', {
        pageId: currentPage._id,
        revisionId: currentPage.revision._id,
        newPagePath,
      });

      if (onRenamed != null) {
        onRenamed(currentPage.path, newPagePath);
      }

      toastSuccess(t('renamed_pages', { path: currentPage.path }));
    }
    catch (err) {
      setRenameInputShown(true);
      toastError(err);
    }
  };

  return pagePathSubmitHandler;
};
