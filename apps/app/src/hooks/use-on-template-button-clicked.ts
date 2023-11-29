import { useCallback, useState } from 'react';

import { useRouter } from 'next/router';

import { createPage, exist } from '~/client/services/page-operation';
import { toastError } from '~/client/util/toastr';
import { LabelType } from '~/interfaces/template';

export const useOnTemplateButtonClicked = (
    currentPagePath?: string,
): {
  onClickHandler: (label: LabelType) => Promise<void>,
  isPageCreating: boolean
} => {
  const router = useRouter();
  const [isPageCreating, setIsPageCreating] = useState(false);

  const onClickHandler = useCallback(async(label: LabelType) => {
    try {
      setIsPageCreating(true);

      const path = currentPagePath == null || currentPagePath === '/'
        ? `/${label}`
        : `${currentPagePath}/${label}`;

      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: 4,
      // grant: currentPage?.grant || 1,
      // grantUserGroupId: currentPage?.grantedGroup?._id,
      };

      const res = await exist(JSON.stringify([path]));
      if (!res.pages[path]) {
        await createPage(path, '', params);
      }

      router.push(`${path}#edit`);
    }
    catch (err) {
      toastError(err);
    }
    finally {
      setIsPageCreating(false);
    }
  }, [currentPagePath, router]);

  return { onClickHandler, isPageCreating };
};
