import { useCallback } from 'react';

import { useRouter } from 'next/router';

import { createPage } from '~/client/services/page-operation';
import { useIsNotFound } from '~/stores/page';
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

  return useCallback(async(pagePath, opts = {}) => {
    const {
      onCreationStart, onCreated, onAborted, onError, onTerminated,
    } = opts;

    if (isNotFound == null || !isNotFound || pagePath == null) {
      onAborted?.();
      onTerminated?.();
      return;
    }

    try {
      onCreationStart?.();

      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: 4,
        // grant,
        // grantUserGroupId,
      };

      const response = await createPage(pagePath, '', params);

      // Should not mutateEditorMode as it might prevent transitioning during mutation
      router.push(`${response.page.id}#edit`);

      onCreated?.();
    }
    catch (err) {
      logger.warn(err);
      onError?.(err);
    }
    finally {
      onTerminated?.();
    }

  }, [isNotFound, router]);
};
