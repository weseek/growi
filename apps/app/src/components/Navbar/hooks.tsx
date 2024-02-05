import { useCallback } from 'react';

import type { PageGrant, IGrantedGroup } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { createPage } from '~/client/services/page-operation';
import { toastError } from '~/client/util/toastr';
import { useIsNotFound } from '~/stores/page';
import { EditorMode, useEditorMode } from '~/stores/ui';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:Navbar:GrowiContextualSubNavigation');

export const useOnPageEditorModeButtonClicked = (
    setIsCreating:React.Dispatch<React.SetStateAction<boolean>>,
    path?: string,
    parentGrant?: PageGrant,
    parentGrantUserGroupIds?: IGrantedGroup[],
): (editorMode: EditorMode) => Promise<void> => {
  const router = useRouter();
  const { t } = useTranslation('commons');
  const { data: isNotFound } = useIsNotFound();
  const { mutate: mutateEditorMode } = useEditorMode();

  return useCallback(async(editorMode: EditorMode) => {
    if (isNotFound == null || path == null) {
      return;
    }

    if (editorMode === EditorMode.Editor && isNotFound) {
      try {
        setIsCreating(true);

        const params = {
          isSlackEnabled: false,
          slackChannels: '',
          grant: parentGrant ?? 1,
          grantUserGroupId: parentGrantUserGroupIds ?? undefined,
        };

        const response = await createPage(path, '', params);

        // Should not mutateEditorMode as it might prevent transitioning during mutation
        router.push(`${response.page.id}#edit`);
      }
      catch (err) {
        logger.warn(err);
        toastError(t('toaster.create_failed', { target: path }));
      }
      finally {
        setIsCreating(false);
      }
    }

    mutateEditorMode(editorMode);
  }, [isNotFound, mutateEditorMode, parentGrant, parentGrantUserGroupIds, path, router, setIsCreating, t]);
};
