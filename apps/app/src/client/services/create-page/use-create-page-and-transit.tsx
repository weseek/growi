import { useCallback, useState } from 'react';

import { shouldCreateWipPage } from '@growi/core/dist/utils';
import { useRouter } from 'next/router';

import { createPage, exist } from '~/client/services/page-operation';
import type { IApiv3PageCreateParams } from '~/interfaces/apiv3';
import { useCurrentPagePath } from '~/stores/page';
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
 * Always invoked after processing is terminated
 */
type OnTerminated = () => void;

type CreatePageAndTransitOpts = {
  shouldCheckPageExists?: boolean,
  onCreationStart?: OnCreated,
  onCreated?: OnCreated,
  onAborted?: OnAborted,
  onTerminated?: OnTerminated,
}

type CreatePageAndTransit = (
  params: IApiv3PageCreateParams,
  opts?: CreatePageAndTransitOpts,
) => Promise<void>;

type UseCreatePageAndTransit = () => {
  isCreating: boolean,
  createAndTransit: CreatePageAndTransit,
};

export const useCreatePageAndTransit: UseCreatePageAndTransit = () => {

  const router = useRouter();

  const { data: currentPagePath } = useCurrentPagePath();
  const { mutate: mutateEditorMode } = useEditorMode();

  const [isCreating, setCreating] = useState(false);

  const createAndTransit: CreatePageAndTransit = useCallback(async(params, opts = {}) => {
    const {
      shouldCheckPageExists,
      onCreationStart, onCreated, onAborted, onTerminated,
    } = opts;

    // check the page existence
    if (shouldCheckPageExists && params.path != null) {
      const pagePath = params.path;

      try {
        const { isExist } = await exist(pagePath);

        if (isExist) {
          // routing
          if (pagePath !== currentPagePath) {
            await router.push(`${pagePath}#edit`);
          }
          mutateEditorMode(EditorMode.Editor);
          onAborted?.();
          return;
        }
      }
      catch (err) {
        throw err;
      }
      finally {
        onTerminated?.();
      }
    }

    // create and transit
    try {
      setCreating(true);
      onCreationStart?.();

      const response = await createPage({ ...params, wip: shouldCreateWipPage(params.path) });

      await router.push(`/${response.page._id}#edit`);
      mutateEditorMode(EditorMode.Editor);

      onCreated?.();
    }
    catch (err) {
      throw err;
    }
    finally {
      onTerminated?.();
      setCreating(false);
    }

  }, [currentPagePath, mutateEditorMode, router]);

  return {
    isCreating,
    createAndTransit,
  };
};
