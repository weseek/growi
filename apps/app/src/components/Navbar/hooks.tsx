import { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { createPage, exist } from '~/client/services/page-operation';
import { toastError } from '~/client/util/toastr';
import { useIsNotFound } from '~/stores/page';
import { EditorMode, useEditorMode } from '~/stores/ui';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:Navbar:GrowiContextualSubNavigation');

export const useOnPageEditorModeButtonClicked = (
    setIsCreating:React.Dispatch<React.SetStateAction<boolean>>,
    path?: string,
    // grant?: number,
    // grantUserGroupId?: string,
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
          grant: 4,
          // grant,
          // grantUserGroupId,
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
  }, [isNotFound, mutateEditorMode, path, router, setIsCreating, t]);
};

export const useOnTemplateForChildrenButtonClicked = (
    setIsCreating: React.Dispatch<React.SetStateAction<boolean>>,
    currentPagePath: string,
): () => Promise<void> => {
  const router = useRouter();

  return useCallback(async() => {
    try {
      setIsCreating(true);

      const path = currentPagePath == null || currentPagePath === '/'
        ? '/_template'
        : `${currentPagePath}/_template`;

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
      logger.warn(err);
      toastError(err);
    }
    finally {
      setIsCreating(false);
    }
  }, [currentPagePath, router, setIsCreating]);
};


export const useOnTemplateForDescendantsButtonClicked = (
    setIsCreating: React.Dispatch<React.SetStateAction<boolean>>,
    currentPagePath: string,
): () => Promise<void> => {
  const router = useRouter();

  return useCallback(async() => {
    try {
      setIsCreating(true);

      const path = currentPagePath == null || currentPagePath === '/'
        ? '/__template'
        : `${currentPagePath}/__template`;

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
      logger.warn(err);
      toastError(err);
    }
    finally {
      setIsCreating(false);
    }
  }, [currentPagePath, router, setIsCreating]);
};
