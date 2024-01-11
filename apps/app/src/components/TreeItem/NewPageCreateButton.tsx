import React, { FC } from 'react';

import { pagePathUtils } from '@growi/core/dist/utils';

import { NotAvailableForGuest } from '~/components/NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '~/components/NotAvailableForReadOnlyUser';
import { IPageForItem } from '~/interfaces/page';

type NewPageCreateButtonProps = {
  page: IPageForItem,
  onClick?: () => void,
};

export const NewPageCreateButton: FC<NewPageCreateButtonProps> = (props) => {
  const {
    page, onClick,
  } = props;

  return (
    <>
      {!pagePathUtils.isUsersTopPage(page.path ?? '') && (
        <NotAvailableForGuest>
          <NotAvailableForReadOnlyUser>
            <button
              id="page-create-button-in-page-tree"
              type="button"
              className="border-0 rounded btn btn-page-item-control p-0 grw-visible-on-hover"
              onClick={onClick}
            >
              <i className="icon-plus d-block p-0" />
            </button>
          </NotAvailableForReadOnlyUser>
        </NotAvailableForGuest>
      )}
    </>
  );
};
