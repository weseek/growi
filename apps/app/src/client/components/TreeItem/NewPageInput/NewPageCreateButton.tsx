import React, { type FC } from 'react';

import { pagePathUtils } from '@growi/core/dist/utils';

import { NotAvailableForGuest } from '~/client/components/NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '~/client/components/NotAvailableForReadOnlyUser';
import type { IPageForItem } from '~/interfaces/page';

type NewPageCreateButtonProps = {
  page: IPageForItem;
  onClick?: () => void;
};

export const NewPageCreateButton: FC<NewPageCreateButtonProps> = (props) => {
  const { page, onClick } = props;

  return (
    <>
      {!pagePathUtils.isUsersTopPage(page.path ?? '') && (
        <NotAvailableForGuest>
          <NotAvailableForReadOnlyUser>
            <button id="page-create-button-in-page-tree" type="button" className="border-0 rounded btn btn-page-item-control p-0" onClick={onClick}>
              <span className="material-symbols-outlined p-0">add_circle</span>
            </button>
          </NotAvailableForReadOnlyUser>
        </NotAvailableForGuest>
      )}
    </>
  );
};
