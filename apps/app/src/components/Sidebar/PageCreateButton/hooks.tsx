import { useCallback, useState } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useRouter } from 'next/router';

import { createPage, exist } from '~/client/services/page-operation';
import { toastError } from '~/client/util/toastr';

export const useOnNewButtonClicked = (
    currentPage?: IPagePopulatedToShowRevision | null,
    isLoading?: boolean,
): {
  onClickHandler: () => Promise<void>,
  isPageCreating: boolean
} => {
  const router = useRouter();
  const [isPageCreating, setIsPageCreating] = useState(false);

  const onClickHandler = useCallback(async() => {
    if (isLoading) return;

    try {
      setIsPageCreating(true);

      /**
       * !! NOTICE !! - Verification of page createable or not is checked on the server side.
       * since the new page path is not generated on the client side.
       * need shouldGeneratePath flag.
       */
      const shouldUseRootPath = currentPage?.path == null;
      const parentPath = shouldUseRootPath
        ? '/'
        : currentPage.path;

      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: shouldUseRootPath ? 1 : currentPage.grant,
        grantUserGroupIds: shouldUseRootPath ? undefined : currentPage.grantedGroups,
        shouldGeneratePath: true,
      };

      // !! NOTICE !! - if shouldGeneratePath is flagged, send the parent page path
      const response = await createPage(parentPath, '', params);

      router.push(`/${response.page.id}#edit`);
    }
    catch (err) {
      toastError(err);
    }
    finally {
      setIsPageCreating(false);
    }
  }, [currentPage, isLoading, router]);

  return { onClickHandler, isPageCreating };
};

export const useOnTodaysButtonClicked = (
    todaysPath: string | null,
): {
  onClickHandler: () => Promise<void>,
  isPageCreating: boolean
} => {
  const router = useRouter();
  const [isPageCreating, setIsPageCreating] = useState(false);

  const onClickHandler = useCallback(async() => {
    if (todaysPath == null) {
      return;
    }

    try {
      setIsPageCreating(true);

      // TODO: get grant, grantUserGroupId data from parent page
      // https://redmine.weseek.co.jp/issues/133892
      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: 4,
      };

      const res = await exist(JSON.stringify([todaysPath]));
      if (!res.pages[todaysPath]) {
        await createPage(todaysPath, '', params);
      }

      router.push(`${todaysPath}#edit`);
    }
    catch (err) {
      toastError(err);
    }
    finally {
      setIsPageCreating(false);
    }
  }, [router, todaysPath]);

  return { onClickHandler, isPageCreating };
};
