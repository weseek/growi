import React from 'react';

import { useTranslation } from 'next-i18next';

import { useCurrentPagePath } from '~/stores/page';

type SearchButtonProps = {
  children: React.ReactNode
  onClick: () => void
}
const SearchButton = (props: SearchButtonProps): JSX.Element => {
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


type SearchButtonsProps = {
  searchKeyword: string
}
export const SearchButtons = (props: SearchButtonsProps): JSX.Element => {
  const { t } = useTranslation('commons');

  const { data: currentPagePath } = useCurrentPagePath();

  const { searchKeyword } = props;

  const shouldShowButton = searchKeyword.length > 0;

  return (
    <table className="table">
      <tbody>
        { shouldShowButton && (
          <SearchButton onClick={() => {}}>
            <span>{searchKeyword}</span>
            <div className="ms-auto">
              <span>{t('search_buttons.search_in_all')}</span>
            </div>
          </SearchButton>
        )}

        <SearchButton onClick={() => {}}>
          <code>{currentPagePath}</code>
          <span className="ms-2">{searchKeyword}</span>
          <div className="ms-auto">
            <span>{t('search_buttons.only_children_of_this_tree')}</span>
          </div>
        </SearchButton>

        { shouldShowButton && (
          <SearchButton onClick={() => {}}>
            <span>{`"${searchKeyword}"`}</span>
            <div className="ms-auto">
              <span>{t('search_buttons.exact_mutch')}</span>
            </div>
          </SearchButton>
        ) }
      </tbody>
    </table>
  );
};
