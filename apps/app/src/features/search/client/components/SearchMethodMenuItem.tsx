import React from 'react';

import { useTranslation } from 'next-i18next';

import { useCurrentPagePath } from '~/stores/page';

import { SearchMenuItem } from './SearchMenuItem';


type Props = {
  searchKeyword: string
}

export const SearchMethodMenuItem = (props: Props): JSX.Element => {
  const { searchKeyword } = props;

  const { t } = useTranslation('commons');

  const { data: currentPagePath } = useCurrentPagePath();

  const shouldShowMenuItem = searchKeyword.length > 0;

  return (
    <>
      { shouldShowMenuItem && (
        <SearchMenuItem href={`/_search?q=${searchKeyword}`}>
          <span className="material-symbols-outlined fs-4 me-3">search</span>
          <span>{searchKeyword}</span>
          <div className="ms-auto">
            <span>{t('search_method_menu_item.search_in_all')}</span>
          </div>
        </SearchMenuItem>
      )}

      <SearchMenuItem href={`/_search?q=prefix:${currentPagePath} ${searchKeyword}`}>
        <span className="material-symbols-outlined fs-4 me-3">search</span>
        <code>prefix: {currentPagePath}</code>
        <span className="ms-2">{searchKeyword}</span>
        <div className="ms-auto">
          <span>{t('search_method_menu_item.only_children_of_this_tree')}</span>
        </div>
      </SearchMenuItem>

      { shouldShowMenuItem && (
        <SearchMenuItem href={`/_search?q="${searchKeyword}"`}>
          <span className="material-symbols-outlined fs-4 me-3">search</span>
          <span>{`"${searchKeyword}"`}</span>
          <div className="ms-auto">
            <span>{t('search_method_menu_item.exact_mutch')}</span>
          </div>
        </SearchMenuItem>
      ) }
    </>
  );
};
