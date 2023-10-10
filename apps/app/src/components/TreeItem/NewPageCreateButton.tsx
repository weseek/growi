import React, {
  useCallback, FC,
} from 'react';

import { pagePathUtils } from '@growi/core/dist/utils';

import { NotAvailableForGuest } from '~/components/NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '~/components/NotAvailableForReadOnlyUser';
import { IPageForItem } from '~/interfaces/page';
import { usePageTreeDescCountMap } from '~/stores/ui';

import { ItemNode } from './ItemNode';

type StateHandlersType = {
  isOpen: boolean,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  isCreating: boolean,
  setCreating: React.Dispatch<React.SetStateAction<boolean>>,
};

export type NewPageCreateButtonProps = {
  page: IPageForItem,
  currentChildren: ItemNode[],
  stateHandlers: StateHandlersType,
  isNewPageInputShown?: boolean,
  setNewPageInputShown: React.Dispatch<React.SetStateAction<boolean>>,
};

export const NewPageCreateButton: FC<NewPageCreateButtonProps> = (props) => {
  const {
    page, currentChildren, stateHandlers, setNewPageInputShown,
  } = props;

  const { setIsOpen } = stateHandlers;

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

  const test = pagePathUtils;
  console.dir(test);

  return (
    <>
      {!pagePathUtils.isUsersTopPage(page.path ?? '') && (
        <NotAvailableForGuest>
          <NotAvailableForReadOnlyUser>
            <button
              id="page-create-button-in-page-tree"
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
