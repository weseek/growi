import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DuplicatingPageSubnavigation from './Duplication/DuplicatingPageSubNavigation';
import DuplicatedAlert from './Duplication/DuplicationAlert';
// import PageListItem from './Page/PageListItem';
import PageListIcon from './Icons/PageListIcon';

const DuplicatingPage: FC = (props) => {
  const { t } = useTranslation();
  const newProps = {
    pageId: '',
    path: '/Sandbox',
  };

  const accessory = {
    name: 'pagelist',
    Icon: <PageListIcon />,
    i18n: t('page_list'),
  };

  return (
    <div className="duplicate-page">
      <DuplicatingPageSubnavigation {...newProps} />
      <div className="container duplicate-content d-flex">
        <div className="flex-grow-1">
          <div className="mb-4">
            <DuplicatedAlert path={newProps.path} />
          </div>
          <div className="page-list">
            <div className="page-list-ul border p-3">
              {/* Iterate pages here */}
              {/* <PageListItem page={} /> */}
            </div>
          </div>
        </div>
        <div className="d-none d-lg-block">
          {/* page list btn */}
          <a href="#" className="d-flex border rounded-pill justify-content-between align-items-center pl-3 pr-4 grw-page-list-btn">
            {/* icon */}
            <div className="grw-page-accessories-control">
              <div id={`shareLink-btn-wrapper-for-tooltip-for-${accessory.name}`}>
                <button
                  type="button"
                  className="btn btn-link grw-btn-page-accessories"
                  onClick={() => { /* open page list of all duplicate pages */ }}
                >
                  {accessory.Icon}
                </button>
              </div>
            </div>
            {/* name */}
            <div className="mx-5">{accessory.i18n}</div>
            {/* page count */}
            <div className="rounded">17</div>
          </a>
        </div>
      </div>
    </div>
  );

};

export default DuplicatingPage;
