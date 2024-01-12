import React, { useState, type FC, useCallback } from 'react';

import { apiv3Post } from '~/client/util/apiv3-client';
import { useSWRxPageChildren } from '~/stores/page-listing';
import { usePageTreeDescCountMap } from '~/stores/ui';

import type { SimpleItemContentProps } from '../interfaces';

import { NewPageCreateButton } from './NewPageCreateButton';
import { NewPageInput } from './NewPageInput';

type UseNewPageInput = {
  Input: FC<SimpleItemContentProps>,
  CreateButton: FC<SimpleItemContentProps>,
  isProcessingSubmission: boolean,
}

export const useNewPageInput = (): UseNewPageInput => {

  const [showInput, setShowInput] = useState(false);
  const [isProcessingSubmission, setProcessingSubmission] = useState(false);

  const { getDescCount } = usePageTreeDescCountMap();

  const CreateButton: FC<SimpleItemContentProps> = (props) => {

    const { page, children, stateHandlers } = props;
    const { setIsOpen } = stateHandlers;

    // descendantCount
    const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

    const isChildrenLoaded = children?.length > 0;
    const hasDescendants = descendantCount > 0 || isChildrenLoaded;

    const onClick = useCallback(() => {
      setShowInput(true);

      if (hasDescendants) {
        setIsOpen(true);
      }
    }, [hasDescendants, setIsOpen]);

    return (
      <NewPageCreateButton
        page={props.page}
        onClick={onClick}
      />
    );
  };

  const Input: FC<SimpleItemContentProps> = (props) => {

    const {
      page, children, stateHandlers,
    } = props;

    const { isOpen, setIsOpen } = stateHandlers;

    const { mutate: mutateChildren } = useSWRxPageChildren(isOpen ? page._id : null);

    const { getDescCount } = usePageTreeDescCountMap();
    const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

    const isChildrenLoaded = children?.length > 0;
    const hasDescendants = descendantCount > 0 || isChildrenLoaded;

    const submitHandler = useCallback(async(newPagePath: string) => {
      setProcessingSubmission(true);

      setShowInput(false);

      await apiv3Post('/pages/', {
        path: newPagePath,
        body: undefined,
        grant: page.grant,
        // grantUserGroupId: page.grantedGroup,
        grantUserGroupIds: page.grantedGroups,
      });

      mutateChildren();

      if (!hasDescendants) {
        setIsOpen(true);
      }
    }, [hasDescendants, mutateChildren, page.grant, page.grantedGroups, setIsOpen]);

    const submittionFailedHandler = useCallback(() => {
      setProcessingSubmission(false);
    }, []);

    return showInput
      ? (
        <NewPageInput
          page={props.page}
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
