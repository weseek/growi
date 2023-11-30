import React from 'react';

import { useTranslation } from 'next-i18next';

type Props = {
  searchText: string
}

export const SearchButtons = (props: Props): JSX.Element => {
  const { t } = useTranslation('commons');
  const { searchText } = props;

  const shouldShowButton = searchText.length > 0;

  return (
    <table className="table">
      <tbody>

        { shouldShowButton && (
          <tr>
            <div className="text-muted ps-1 d-flex">
              <span className="material-symbols-outlined fs-4 me-3">search</span>
              <span>{searchText}</span>
              <div className="ms-auto">
                <span>Search in all</span>
              </div>
            </div>
          </tr>
        )}

        <tr>
          <div className="text-muted ps-1 d-flex">
            <span className="material-symbols-outlined fs-4 me-3">search</span>
            <code>~pagehoge/</code>
            <span className="ms-2">{searchText}</span>
            <div className="ms-auto">
              <span>{t('header_search_box.item_label.This tree')}</span>
            </div>
          </div>
        </tr>

        { shouldShowButton && (
          <tr>
            <div className="text-muted ps-1 d-flex">
              <span className="material-symbols-outlined fs-4 me-3">search</span>
              <span>{`"${searchText}"`}</span>
              <div className="ms-auto">
                <span>Exact match</span>
              </div>
            </div>
          </tr>
        ) }

      </tbody>
    </table>
  );
};
