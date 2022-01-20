import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import DuplicatePageSubnavigation from './Duplication/DuplicatePageSubnavigation';
import DuplicatePageAlert from './Duplication/DuplicatePageAlert';
import PageListIcon from './Icons/PageListIcon';
// import PageListItem from './Page/PageListItem';

// Todo: add type

const DuplicatingPage: FC = (props) => {
  const { t } = useTranslation();

  const accessory = {
    name: 'pagelist',
    Icon: <PageListIcon />,
    i18n: t('page_list'),
  };

  return (
    <div className="duplicate-page">
      <DuplicatePageSubnavigation {...props} />
      <div className="container duplicate-content d-flex">
        {/* main content */}
        <div className="flex-grow-1">
          <div className="mb-4">
            {/* Todo: pass duplicate path */}
            <DuplicatePageAlert path="/hoge" />
          </div>
          <div className="page-list">
            <div className="page-list-ul border p-3">
              {/* Todo: Iterate pages here */}
              {/* <PageListItem page={} /> */}
            </div>
          </div>
        </div>
        {/* page list btn */}
        <div className="d-none d-lg-block">
          <a href="#" className="d-flex border rounded-pill justify-content-between align-items-center pl-3 pr-4 grw-page-list-btn">
            {/* icon */}
            <div className="grw-page-accessories-control">
              <div id={`shareLink-btn-wrapper-for-tooltip-for-${accessory.name}`}>
                <button
                  type="button"
                  className="btn btn-link grw-btn-page-accessories"
                  onClick={() => { /* Todo: open page list of all duplicate pages */ }}
                >
                  {accessory.Icon}
                </button>
              </div>
            </div>
            {/* name */}
            <div className="mx-5">{accessory.i18n}</div>
            {/* page count */}
            {/* Todo: add page count */}
            <div className="rounded">17</div>
          </a>
        </div>
      </div>
    </div>
  );

};

export default DuplicatingPage;
