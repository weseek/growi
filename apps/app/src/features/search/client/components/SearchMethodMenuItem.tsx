import React from 'react';

import { useTranslation } from 'next-i18next';

import { useCurrentPagePath } from '~/stores/page';

import type { GetItemProps } from '../interfaces/downshift';

import { SearchMenuItem } from './SearchMenuItem';

import styles from './SearchMethodMenuItem.module.scss';

type Props = {
  activeIndex: number | null
  searchKeyword: string
  getItemProps: GetItemProps
}

export const SearchMethodMenuItem = (props: Props): JSX.Element => {
  const {
    activeIndex, searchKeyword, getItemProps,
  } = props;

  const { t } = useTranslation('commons');

  const { data: currentPagePath } = useCurrentPagePath();

  const shouldShowMenuItem = searchKeyword.trim().length > 0;

  return (
    <div className={`${styles['search-method-menu-item']} search-method-menu-item `}>
      { shouldShowMenuItem && (
        <div data-testid="search-all-menu-item">
          <SearchMenuItem
            index={0}
            isActive={activeIndex === 0}
            getItemProps={getItemProps}
            url={`/_search?q=${searchKeyword}`}
          >
            <span className="material-symbols-outlined fs-4 me-3">search</span>
            <span>{searchKeyword}</span>
            <div className="ms-auto">
              <span className="method-range-explain">{t('search_method_menu_item.search_in_all')}</span>
            </div>
          </SearchMenuItem>
        </div>
      )}

      <div data-testid="search-prefix-menu-item">
        <SearchMenuItem
          index={shouldShowMenuItem ? 1 : 0}
          isActive={activeIndex === (shouldShowMenuItem ? 1 : 0)}
          getItemProps={getItemProps}
          url={`/_search?q=prefix:${currentPagePath} ${searchKeyword}`}
        >
          <span className="material-symbols-outlined fs-4 me-3">search</span>
          <code>prefix: {currentPagePath}</code>
          <span className="ms-2">{searchKeyword}</span>
          <div className="ms-auto">
            <span className="method-range-explain">{t('search_method_menu_item.only_children_of_this_tree')}</span>
          </div>
        </SearchMenuItem>
      </div>

      { shouldShowMenuItem && (
        <SearchMenuItem
          index={2}
          isActive={activeIndex === 2}
          getItemProps={getItemProps}
          url={`/_search?q="${searchKeyword}"`}
        >
          <span className="material-symbols-outlined fs-4 me-3">search</span>
          <span>{`"${searchKeyword}"`}</span>
          <div className="ms-auto">
            <span className="method-range-explain">{t('search_method_menu_item.exact_mutch')}</span>
          </div>
        </SearchMenuItem>
      ) }
    </div>
  );
};
