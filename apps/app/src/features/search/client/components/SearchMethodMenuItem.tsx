import React from 'react';

import { useTranslation } from 'next-i18next';

import { useCurrentPagePath } from '~/stores/page';

type MenuItemProps = {
  children: React.ReactNode
  onClick: () => void
}
const MenuItem = (props: MenuItemProps): JSX.Element => {
  const { children, onClick } = props;

  return (
    <tr>
      <div className="text-muted ps-1 d-flex">
        <span className="material-symbols-outlined fs-4 me-3">search</span>
        { children }
      </div>
    </tr>
  );
};


type SearchMethodMenuItemProps = {
  searchKeyword: string
}
export const SearchMethodMenuItem = (props: SearchMethodMenuItemProps): JSX.Element => {
  const { t } = useTranslation('commons');

  const { data: currentPagePath } = useCurrentPagePath();

  const { searchKeyword } = props;

  const shouldShowButton = searchKeyword.length > 0;

  return (
    <table className="table">
      <tbody>
        { shouldShowButton && (
          <MenuItem onClick={() => {}}>
            <span>{searchKeyword}</span>
            <div className="ms-auto">
              <span>{t('search_method_menu_item.search_in_all')}</span>
            </div>
          </MenuItem>
        )}

        <MenuItem onClick={() => {}}>
          <code>prefix: {currentPagePath}</code>
          <span className="ms-2">{searchKeyword}</span>
          <div className="ms-auto">
            <span>{t('search_method_menu_item.only_children_of_this_tree')}</span>
          </div>
        </MenuItem>

        { shouldShowButton && (
          <MenuItem onClick={() => {}}>
            <span>{`"${searchKeyword}"`}</span>
            <div className="ms-auto">
              <span>{t('search_method_menu_item.exact_mutch')}</span>
            </div>
          </MenuItem>
        ) }
      </tbody>
    </table>
  );
};
