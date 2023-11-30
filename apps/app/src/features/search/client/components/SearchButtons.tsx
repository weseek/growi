import React from 'react';

import { useTranslation } from 'next-i18next';

export const SearchButtons = (): JSX.Element => {
  const { t } = useTranslation('commons');

  return (
    <table className="table">
      <tbody>
        <tr>
          <div className="text-muted ps-1 d-flex">
            <span className="material-symbols-outlined fs-4 me-3">search</span>
            <div className="ms-auto">
              <span>Search in all</span>
            </div>
          </div>
        </tr>

        <tr>
          <div className="text-muted ps-1 d-flex">
            <span className="material-symbols-outlined fs-4 me-3">search</span>
            <code>~pagehoge/</code>
            <div className="ms-auto">
              <span>{t('header_search_box.item_label.This tree')}</span>
            </div>
          </div>
        </tr>

        <tr>
          <div className="text-muted ps-1 d-flex">
            <span className="material-symbols-outlined fs-4 me-3">search</span>
            <div className="ms-auto">
              <span>Exact match</span>
            </div>
          </div>
        </tr>
      </tbody>
    </table>
  );
};
