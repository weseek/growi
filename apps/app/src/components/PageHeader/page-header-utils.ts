import nodePath from 'path';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useSWRMUTxCurrentPage } from '~/stores/page';
import { mutatePageTree, mutatePageList } from '~/stores/page-listing';
import { mutateSearching } from '~/stores/search';

export const usePagePathRenameHandler = (
    currentPage: IPagePopulatedToShowRevision, currentPagePath: string, onRenameFinish?: () => void, onRenameFailure?: () => void,
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

  const pagePathRenameHandler = async(inputText: string) => {

    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputText);

    if (newPagePath === currentPage.path || inputText === '') {
      onRenameFinish?.();
      return;
    }

    try {
      onRenameFinish?.();
      await apiv3Put('/pages/rename', {
        pageId: currentPage._id,
        revisionId: currentPage.revision._id,
        newPagePath,
      });

      onRenamed(currentPage.path, newPagePath);

      toastSuccess(t('renamed_pages', { path: currentPage.path }));
    }
    catch (err) {
      onRenameFailure?.();
      toastError(err);
    }
  };

  return pagePathRenameHandler;
};
