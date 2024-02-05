import { useCallback, useState } from 'react';

import type { PageGrant, IGrantedGroup } from '@growi/core';
import { isCreatablePage } from '@growi/core/dist/utils/page-path-utils';
import { useRouter } from 'next/router';

import { createPage, exist } from '~/client/services/page-operation';
import { LabelType } from '~/interfaces/template';

export const useOnTemplateButtonClicked = (
    currentPagePath?: string,
    isLoading?: boolean,
    parentGrant?: PageGrant,
    parentGrantUserGroupIds?: IGrantedGroup[],
): {
  onClickHandler: (label: LabelType) => Promise<void>,
  isPageCreating: boolean
} => {
  const router = useRouter();
  const [isPageCreating, setIsPageCreating] = useState(false);

  const onClickHandler = useCallback(async(label: LabelType) => {
    if (isLoading) return;

    try {
      setIsPageCreating(true);

      const targetPath = currentPagePath == null || currentPagePath === '/'
        ? `/${label}`
        : `${currentPagePath}/${label}`;

      const path = isCreatablePage(targetPath) ? targetPath : `/${label}`;

      const res = await exist(JSON.stringify([path]));
      if (!res.pages[path]) {
        const params = {
          isSlackEnabled: false,
          slackChannels: '',
          grant: parentGrant ?? 1,
          grantUserGroupId: parentGrantUserGroupIds ?? undefined,
        };

        await createPage(path, '', params);
      }

      router.push(`${path}#edit`);
    }
    catch (err) {
      throw err;
    }
    finally {
      setIsPageCreating(false);
    }
  }, [currentPagePath, isLoading, parentGrant, parentGrantUserGroupIds, router]);

  return { onClickHandler, isPageCreating };
};
