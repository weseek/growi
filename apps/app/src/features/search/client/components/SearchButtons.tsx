import React from 'react';

import { useTranslation } from 'next-i18next';


type SearchButtonProps = {
  children: React.ReactNode
}
const SearchButton = (props: SearchButtonProps): JSX.Element => {
  const { children } = props;

  return (
    <tr>
      <div className="text-muted ps-1 d-flex">
        <span className="material-symbols-outlined fs-4 me-3">search</span>
        { children }
      </div>
    </tr>
  );
};


type SearchButtonsProps = {
  searchText: string
}
export const SearchButtons = (props: SearchButtonsProps): JSX.Element => {
  const { t } = useTranslation('commons');
  const { searchText } = props;

  const shouldShowButton = searchText.length > 0;

  return (
    <table className="table">
      <tbody>
        { shouldShowButton && (
          <SearchButton>
            <span>{searchText}</span>
            <div className="ms-auto">
              <span>{t('search_buttons.search_in_all')}</span>
            </div>
          </SearchButton>
        )}

        <SearchButton>
          <code>~pagehoge/</code>
          <span className="ms-2">{searchText}</span>
          <div className="ms-auto">
            <span>{t('search_buttons.only_children_of_this_tree')}</span>
          </div>
        </SearchButton>


        { shouldShowButton && (
          <SearchButton>
            <span>{`"${searchText}"`}</span>
            <div className="ms-auto">
              <span>{t('search_buttons.exact_mutch')}</span>
            </div>
          </SearchButton>
        ) }
      </tbody>
    </table>
  );
};
