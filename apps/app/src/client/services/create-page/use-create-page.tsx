import { useCallback, useState } from 'react';

import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { exist, getIsNonUserRelatedGroupsGranted } from '~/client/services/page-operation';
import { toastWarning } from '~/client/util/toastr';
import type { IApiv3PageCreateParams } from '~/interfaces/apiv3';
import { useGrantedGroupsInheritanceSelectModal } from '~/stores/modal';
import { useCurrentPagePath } from '~/stores/page';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { createPage } from './create-page';

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
  skipPageExistenceCheck?: boolean,
  skipTransition?: boolean,
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
  create: CreatePageAndTransit,
};

export const useCreatePage: UseCreatePageAndTransit = () => {

  const router = useRouter();
  const { t } = useTranslation();

  const { data: currentPagePath } = useCurrentPagePath();
  const { mutate: mutateEditorMode } = useEditorMode();
  const { open: openGrantedGroupsInheritanceSelectModal, close: closeGrantedGroupsInheritanceSelectModal } = useGrantedGroupsInheritanceSelectModal();

  const [isCreating, setCreating] = useState(false);

  const create: CreatePageAndTransit = useCallback(async(params, opts = {}) => {
    const {
      skipPageExistenceCheck,
      onCreationStart, onCreated, onAborted, onTerminated,
    } = opts;
    const skipTransition = opts.skipTransition ?? false;

    // check the page existence
    if (!skipPageExistenceCheck && params.path != null) {
      const pagePath = params.path;

      try {
        const { isExist } = await exist(pagePath);

        if (isExist) {
          if (!skipTransition) {
            // routing
            if (pagePath !== currentPagePath) {
              await router.push(`${pagePath}#edit`);
            }
            mutateEditorMode(EditorMode.Editor);
          }
          else {
            toastWarning(t('duplicated_page_alert.same_page_name_exists', { pageName: pagePath }));
          }
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

    const _create = async(onlyInheritUserRelatedGrantedGroups?: boolean) => {
      try {
        setCreating(true);
        onCreationStart?.();

        params.onlyInheritUserRelatedGrantedGroups = onlyInheritUserRelatedGrantedGroups;
        const response = await createPage(params);

        closeGrantedGroupsInheritanceSelectModal();

        if (!skipTransition) {
          await router.push(`/${response.page._id}#edit`);
          mutateEditorMode(EditorMode.Editor);
        }

        onCreated?.();
      }
      catch (err) {
        throw err;
      }
      finally {
        onTerminated?.();
        setCreating(false);
      }
    };

    // If parent page is granted to non-user-related groups, let the user select whether or not to inherit them.
    if (params.parentPath != null) {
      const { isNonUserRelatedGroupsGranted } = await getIsNonUserRelatedGroupsGranted(params.parentPath);
      if (isNonUserRelatedGroupsGranted) {
        // create and transit request will be made from modal
        openGrantedGroupsInheritanceSelectModal(_create);
        return;
      }
    }

    await _create();
  }, [currentPagePath, mutateEditorMode, router, openGrantedGroupsInheritanceSelectModal, closeGrantedGroupsInheritanceSelectModal, t]);

  return {
    isCreating,
    create,
  };
};
