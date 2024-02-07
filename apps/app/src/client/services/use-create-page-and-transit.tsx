import { useCallback } from 'react';

import { useRouter } from 'next/router';

import { createPage } from '~/client/services/page-operation';
import { useIsNotFound, useSWRxCurrentPage } from '~/stores/page';
import { EditorMode, useEditorMode } from '~/stores/ui';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:Navbar:GrowiContextualSubNavigation');

/**
 * Invoked when creation and transition has finished
 */
type OnCreated = () => void;
/**
 * Invoked when either creation or transition has aborted
 */
type OnAborted = () => void;
/**
 * Invoked when an error is occured
 */
type OnError = (err) => void;
/**
 * Always invoked after processing is terminated
 */
type OnTerminated = () => void;

type CreatePageAndTransitOpts = {
  onCreationStart?: OnCreated,
  onCreated?: OnCreated,
  onAborted?: OnAborted,
  onError?: OnError,
  onTerminated?: OnTerminated,
}

type CreatePageAndTransit = (
  pagePath: string | undefined,
  // grant?: number,
  // grantUserGroupId?: string,
  opts?: CreatePageAndTransitOpts,
) => Promise<void>;

export const useCreatePageAndTransit = (): CreatePageAndTransit => {

  const router = useRouter();

  const { data: isNotFound } = useIsNotFound();
  const { data: currentPage, isLoading } = useSWRxCurrentPage();
  const { mutate: mutateEditorMode } = useEditorMode();

  // const {
  //   path: currentPagePath,
  //   grant: currentPageGrant,
  //   grantedGroups: currentPageGrantedGroups,
  // } = currentPage ?? {};

  return useCallback(async(pagePath, opts = {}) => {
    if (isLoading) {
      return;
    }

    const {
      onCreationStart, onCreated, onAborted, onError, onTerminated,
    } = opts;

    if (isNotFound == null || !isNotFound || pagePath == null) {
      mutateEditorMode(EditorMode.Editor);

      onAborted?.();
      onTerminated?.();
      return;
    }

    try {
      onCreationStart?.();

      /**
       * !! NOTICE !! - Verification of page createable or not is checked on the server side.
       * since the new page path is not generated on the client side.
       * need shouldGeneratePath flag.
       */
      // const shouldCreateUnderRoot = currentPagePath == null || currentPageGrant == null;
      // const parentPath = shouldCreateUnderRoot
      //   ? '/'
      //   : currentPagePath;

      // const params = {
      //   isSlackEnabled: false,
      //   slackChannels: '',
      //   grant: shouldCreateUnderRoot ? 1 : currentPageGrant,
      //   grantUserGroupIds: shouldCreateUnderRoot ? undefined : currentPageGrantedGroups,
      //   shouldGeneratePath: true,
      // };

      // !! NOTICE !! - if shouldGeneratePath is flagged, send the parent page path
      // const response = await createPage(parentPath, '', params);

      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: 4,
        // grant,
        // grantUserGroupId,
      };

      const response = await createPage(pagePath, '', params);

      await router.push(`${response.page.id}#edit`);
      mutateEditorMode(EditorMode.Editor);

      onCreated?.();
    }
    catch (err) {
      logger.warn(err);
      onError?.(err);
    }
    finally {
      onTerminated?.();
    }

  }, [isLoading, isNotFound, mutateEditorMode, router]);
};
