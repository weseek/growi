import React from 'react';

import { useTranslation } from 'next-i18next';

import { useCurrentPagePath } from '~/stores/page';

import type { GetItemProps } from '../interfaces/downshift';

import { SearchMenuItem } from './SearchMenuItem';

type ComponentType = 'nomal' | 'tree' | 'exact';

type SearchMethodMenuItemSubstanceProps = {
  index: number
  highlightedIndex: number | null
  searchKeyword: string
  componentType: ComponentType
  getItemProps: GetItemProps
}

const SearchMethodMenuItemSubstance = (props: SearchMethodMenuItemSubstanceProps): JSX.Element => {
  const {
    index, highlightedIndex, searchKeyword, getItemProps, componentType,
  } = props;
  const { t } = useTranslation('commons');
  const { data: currentPagePath } = useCurrentPagePath();

  if (componentType === 'nomal') {
    return (
      <SearchMenuItem index={index} highlightedIndex={highlightedIndex} getItemProps={getItemProps} url={`/_search?q=${searchKeyword}`}>
        <span className="material-symbols-outlined fs-4 me-3">search</span>
        <span>{searchKeyword}</span>
        <div className="ms-auto">
          <span>{t('search_method_menu_item.search_in_all')}</span>
        </div>
      </SearchMenuItem>
    );
  }

  if (componentType === 'tree') {
    return (
      <SearchMenuItem
        index={index}
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
    );
  }

  if (componentType === 'exact') {
    return (
      <SearchMenuItem index={index} highlightedIndex={highlightedIndex} getItemProps={getItemProps} url={`/_search?q="${searchKeyword}"`}>
        <span className="material-symbols-outlined fs-4 me-3">search</span>
        <span>{`"${searchKeyword}"`}</span>
        <div className="ms-auto">
          <span>{t('search_method_menu_item.exact_mutch')}</span>
        </div>
      </SearchMenuItem>
    );
  }

  return (<></>);
};


type SearchMethodMenuItemProps = Omit<SearchMethodMenuItemSubstanceProps, 'componentType' | 'index'> & { searchKeyword: string }

export const SearchMethodMenuItem = (props: SearchMethodMenuItemProps): JSX.Element => {

  const { searchKeyword } = props;

  const isEmptyKeyword = searchKeyword.trim().length === 0;

  const searchMethodMenuItemData: Array<{ componentType: ComponentType }> = isEmptyKeyword
    ? [{ componentType: 'tree' }]
    : [{ componentType: 'nomal' }, { componentType: 'tree' }, { componentType: 'exact' }];

  return (
    <>
      { searchMethodMenuItemData
        .map((item, index) => (
          <SearchMethodMenuItemSubstance key={item.componentType} index={index} componentType={item.componentType} {...props} />
        ))
      }
    </>
  );
};
