import { useCallback, useState } from 'react';

import { useRouter } from 'next/router';

import { exist, getIsNonUserRelatedGroupsGranted } from '~/client/services/page-operation';
import type { IApiv3PageCreateParams } from '~/interfaces/apiv3';
import { useGrantedGroupsInheritanceSelectModal } from '~/stores/modal';
import { useCurrentPagePath } from '~/stores/page';
import { EditorMode, useEditorMode } from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import { createPage } from './create-page';

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

export type CreatePageAndTransitOpts = {
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
  const { open: openGrantedGroupsInheritanceSelectModal, close: closeGrantedGroupsInheritanceSelectModal } = useGrantedGroupsInheritanceSelectModal();

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
        onAborted?.();
        throw err;
      }
      finally {
        onTerminated?.();
      }
    }

    const _createAndTransit = async(onlyInheritUserRelatedGrantedGroups?: boolean) => {
      try {
        setCreating(true);
        onCreationStart?.();

        params.onlyInheritUserRelatedGrantedGroups = onlyInheritUserRelatedGrantedGroups;
        const response = await createPage(params);

        closeGrantedGroupsInheritanceSelectModal();

        await router.push(`/${response.page._id}#edit`);
        mutateEditorMode(EditorMode.Editor);

        onCreated?.();
      }
      catch (err) {
        onAborted?.();
        throw err;
      }
      finally {
        onTerminated?.();
        setCreating(false);
      }
    };

    // If parent page is granted to non-user-related groups, let the user select whether or not to inherit them.
    if (params.parentPath != null) {
      try {
        const { isNonUserRelatedGroupsGranted } = await getIsNonUserRelatedGroupsGranted(params.parentPath);
        if (isNonUserRelatedGroupsGranted) {
          // create and transit request will be made from modal
          openGrantedGroupsInheritanceSelectModal(_createAndTransit);
          return;
        }
      }
      catch (err) {
        // Do not throw error when the parent page is empty, since empty parent page could be created on create request
        if (err[0]?.code !== 'page_unreachable_or_empty') {
          onAborted?.();
          throw err;
        }
      }
    }

    await _createAndTransit();
  }, [currentPagePath, mutateEditorMode, router, openGrantedGroupsInheritanceSelectModal, closeGrantedGroupsInheritanceSelectModal]);

  return {
    isCreating,
    createAndTransit,
  };
};
