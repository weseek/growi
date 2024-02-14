import React, { useState, type FC, useCallback } from 'react';

import { shouldCreateWipPage } from '@growi/core/dist/utils';

import { apiv3Post } from '~/client/util/apiv3-client';
import { useSWRxPageChildren } from '~/stores/page-listing';
import { usePageTreeDescCountMap } from '~/stores/ui';

import type { TreeItemToolProps } from '../interfaces';

import { NewPageCreateButton } from './NewPageCreateButton';
import { NewPageInput } from './NewPageInput';

type UseNewPageInput = {
  Input: FC<TreeItemToolProps>,
  CreateButton: FC<TreeItemToolProps>,
  isProcessingSubmission: boolean,
}

export const useNewPageInput = (): UseNewPageInput => {

  const [showInput, setShowInput] = useState(false);
  const [isProcessingSubmission, setProcessingSubmission] = useState(false);

  const { getDescCount } = usePageTreeDescCountMap();

  const CreateButton: FC<TreeItemToolProps> = (props) => {

    const { itemNode, stateHandlers } = props;
    const { page, children } = itemNode;

    // descendantCount
    const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

    const isChildrenLoaded = children?.length > 0;
    const hasDescendants = descendantCount > 0 || isChildrenLoaded;

    const onClick = useCallback(() => {
      setShowInput(true);

      if (hasDescendants) {
        stateHandlers?.setIsOpen(true);
      }
    }, [hasDescendants, stateHandlers]);

    return (
      <NewPageCreateButton
        page={page}
        onClick={onClick}
      />
    );
  };

  const Input: FC<TreeItemToolProps> = (props) => {

    const { itemNode, stateHandlers } = props;
    const { page, children } = itemNode;

    const { mutate: mutateChildren } = useSWRxPageChildren(stateHandlers?.isOpen ? page._id : null);

    const { getDescCount } = usePageTreeDescCountMap();
    const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

    const isChildrenLoaded = children?.length > 0;
    const hasDescendants = descendantCount > 0 || isChildrenLoaded;

    const submitHandler = useCallback(async(newPagePath: string) => {
      setProcessingSubmission(true);

      setShowInput(false);

      await apiv3Post('/page', {
        path: newPagePath,
        body: undefined,
        grant: page.grant,
        // grantUserGroupId: page.grantedGroup,
        grantUserGroupIds: page.grantedGroups,
        wip: shouldCreateWipPage(newPagePath),
      });

      mutateChildren();

      if (!hasDescendants) {
        stateHandlers?.setIsOpen(true);
      }
    }, [hasDescendants, mutateChildren, page.grant, page.grantedGroups, stateHandlers]);

    const submittionFailedHandler = useCallback(() => {
      setProcessingSubmission(false);
    }, []);

    return showInput
      ? (
        <NewPageInput
          page={page}
          isEnableActions={props.isEnableActions}
          onSubmit={submitHandler}
          onSubmittionFailed={submittionFailedHandler}
          onCanceled={() => setShowInput(false)}
        />
      )
      : <></>;
  };

  return {
    Input,
    CreateButton,
    isProcessingSubmission,
  };
};
