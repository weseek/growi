import { useCallback, useState } from 'react';

import { useRouter } from 'next/router';
import type { Nullable, IPagePopulatedToShowRevision, IUserHasId } from '@growi/core';
import { createPage, exist } from '~/client/services/page-operation';
import { toastError } from '~/client/util/toastr';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:cli:PageCreateButton');

export const useOnNewButtonClicked = (
    currentPage?:  IPagePopulatedToShowRevision | null | undefined,
): {
  onClickHandler: () => Promise<void>,
  isPageCreating: boolean
} => {
  const router = useRouter();
  const [isPageCreating, setIsPageCreating] = useState(false);

  const onClickHandler = useCallback(async() => {
    // if (isLoading) return;

    try {
      setIsPageCreating(true);

      const parentPath = currentPage == null
        ? '/'
        : currentPage.path;

      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: 4,
        // grant: currentPage?.grant || 1,
        // grantUserGroupId: currentPage?.grantedGroup?._id,
        shouldGeneratePath: true,
      };

      const response = await createPage(parentPath, '', params);

      router.push(`${response.page.id}#edit`);
    }
    catch (err) {
      logger.warn(err);
      toastError(err);
    }
    finally {
      setIsPageCreating(false);
    }
  }, [currentPage, router]);

  return { onClickHandler, isPageCreating };
};

export const useOnTodaysButtonClicked = (
  todaysPath: string,
  currentUser?: Nullable<IUserHasId> | undefined,
): {
onClickHandler: () => Promise<void>,
isPageCreating: boolean
} => {
  const router = useRouter();
  const [isPageCreating, setIsPageCreating] = useState(false);

  const onClickHandler = useCallback(async() => {
    if (currentUser == null) {
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
      logger.warn(err);
      toastError(err);
    }
    finally {
      setIsPageCreating(false);
    }
  }, [currentUser, router, todaysPath]);

  return { onClickHandler, isPageCreating };
};
