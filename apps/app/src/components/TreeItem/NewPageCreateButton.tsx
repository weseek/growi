import React, {
  useCallback,
} from 'react';

import { pagePathUtils } from '@growi/core';

import { NotAvailableForGuest } from '~/components/NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '~/components/NotAvailableForReadOnlyUser';
import { usePageTreeDescCountMap } from '~/stores/ui';

export const NewPageCreateButton = (props) => {
  const {
    page, children, stateHandlers, setNewPageInputShown,
  } = props;

  const { setIsOpen } = stateHandlers;

  const currentChildren = children;

  // descendantCount
  const { getDescCount } = usePageTreeDescCountMap();
  const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

  const isChildrenLoaded = currentChildren?.length > 0;
  const hasDescendants = descendantCount > 0 || isChildrenLoaded;

  const onClickPlusButton = useCallback(() => {
    setNewPageInputShown(true);

    if (hasDescendants) {
      setIsOpen(true);
    }
  }, [hasDescendants, setIsOpen]);

  return (
    <>
      {!pagePathUtils.isUsersTopPage(page.path ?? '') && (
        <NotAvailableForGuest>
          <NotAvailableForReadOnlyUser>
            <button
              id='page-create-button-in-page-tree'
              type="button"
              className="border-0 rounded btn btn-page-item-control p-0 grw-visible-on-hover"
              onClick={onClickPlusButton}
            >
              <i className="icon-plus d-block p-0" />
            </button>
          </NotAvailableForReadOnlyUser>
        </NotAvailableForGuest>
      )}
    </>
  );
};
