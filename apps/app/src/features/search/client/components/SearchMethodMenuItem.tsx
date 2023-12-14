import React from 'react';

import { useTranslation } from 'next-i18next';

import { useCurrentPagePath } from '~/stores/page';

import type { GetItemProps } from '../interfaces/downshift';

import { SearchMenuItem } from './SearchMenuItem';

type Props = {
  highlightedIndex: number | null
  searchKeyword: string
  getItemProps: GetItemProps
}

export const SearchMethodMenuItem = (props: Props): JSX.Element => {
  const {
    highlightedIndex, searchKeyword, getItemProps,
  } = props;

  const { t } = useTranslation('commons');

  const { data: currentPagePath } = useCurrentPagePath();

  const shouldShowMenuItem = searchKeyword.length > 0;

  return (
    <>
      { shouldShowMenuItem && (
        <SearchMenuItem
          index={0}
          highlightedIndex={highlightedIndex}
          getItemProps={getItemProps}
          url={`/_search?q=${searchKeyword}`}
        >
          <span className="material-symbols-outlined fs-4 me-3">search</span>
          <span>{searchKeyword}</span>
          <div className="ms-auto">
            <span>{t('search_method_menu_item.search_in_all')}</span>
          </div>
        </SearchMenuItem>
      )}

      <SearchMenuItem
        index={shouldShowMenuItem ? 1 : 0}
        highlightedIndex={highlightedIndex}
        getItemProps={getItemProps}
        url={`/_search?q=prefix:${currentPagePath} ${searchKeyword}`}
      >
        <span className="material-symbols-outlined fs-4 me-3">search</span>
        <code>prefix: {currentPagePath}</code>
        <span className="ms-2">{searchKeyword}</span>
        <div className="ms-auto">
          <span>{t('search_method_menu_item.only_children_of_this_tree')}</span>
        </div>
      </SearchMenuItem>

      { shouldShowMenuItem && (
        <SearchMenuItem
          index={2}
          highlightedIndex={highlightedIndex}
          getItemProps={getItemProps}
          url={`/_search?q="${searchKeyword}"`}
        >
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
