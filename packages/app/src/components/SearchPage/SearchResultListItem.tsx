import React, { FC } from 'react';

import Clamp from 'react-multiline-clamp';

import { useTranslation } from 'react-i18next';
import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';
import { DevidedPagePath } from '@growi/core';
import { IPageSearchResultData } from '../../interfaces/search';

import { IPageHasId } from '~/interfaces/page';

type PageItemControlProps = {
  page: IPageHasId,
}

const PageItemControl: FC<PageItemControlProps> = (props: {page: IPageHasId}) => {

  const { page } = props;
  const { t } = useTranslation('');

  return (
    <>
      <button
        type="button"
        className="btn-link nav-link dropdown-toggle dropdown-toggle-no-caret border-0 rounded grw-btn-page-management py-0"
        data-toggle="dropdown"
      >
        <i className="fa fa-ellipsis-v text-muted"></i>
      </button>
      <div className="dropdown-menu dropdown-menu-right">

        {/* TODO: if there is the following button in XD add it here
        <button
          type="button"
          className="btn btn-link p-0"
          value={page.path}
          onClick={(e) => {
            window.location.href = e.currentTarget.value;
          }}
        >
          <i className="icon-login" />
        </button>
        */}

        {/*
          TODO: add function to the following buttons like using modal or others
          ref: https://estoc.weseek.co.jp/redmine/issues/79026
        */}
        <button className="dropdown-item text-danger" type="button" onClick={() => console.log('delete modal show')}>
          <i className="icon-fw icon-fire"></i>{t('Delete')}
        </button>
        <button className="dropdown-item" type="button" onClick={() => console.log('duplicate modal show')}>
          <i className="icon-fw icon-star"></i>{t('Add to bookmark')}
        </button>
        <button className="dropdown-item" type="button" onClick={() => console.log('duplicate modal show')}>
          <i className="icon-fw icon-docs"></i>{t('Duplicate')}
        </button>
        <button className="dropdown-item" type="button" onClick={() => console.log('rename function will be added')}>
          <i className="icon-fw  icon-action-redo"></i>{t('Move/Rename')}
        </button>
      </div>
    </>
  );

};

type Props = {
  page: IPageSearchResultData,
  isSelected: boolean,
  onClickInvoked?: (pageId: string) => void,
}

const SearchResultListItem: FC<Props> = (props:Props) => {
  const { page: { pageData, pageMeta }, isSelected } = props;

  // Add prefix 'id_' in pageId, because scrollspy of bootstrap doesn't work when the first letter of id attr of target component is numeral.
  const pageId = `#${pageData._id}`;

  const isPathIncludedHtml = pageMeta.elasticSearchResult.highlightedPath != null;
  const dPagePath = new DevidedPagePath(pageData.path, false, true);
  const pagePathElem = <PagePathLabel path={pageMeta.elasticSearchResult.highlightedPath} isFormerOnly isPathIncludedHtml={isPathIncludedHtml} />;

  const onClickInvoked = (pageId) => {
    if (props.onClickInvoked != null) {
      props.onClickInvoked(pageId);
    }
  };

  return (
    <li key={pageData._id} className={`page-list-li search-page-item w-100 border-bottom px-4 list-group-item-action ${isSelected ? 'active' : ''}`}>
      <a
        className="d-block pt-3"
        href={pageId}
        onClick={() => onClickInvoked(pageData._id)}
      >
        <div className="d-flex">
          {/* checkbox */}
          <div className="form-check my-auto mr-3">
            <input className="form-check-input my-auto" type="checkbox" value="" id="flexCheckDefault" />
          </div>
          <div className="w-100">
            {/* page path */}
            <small className="mb-1">
              <i className="icon-fw icon-home"></i>
              {pagePathElem}
            </small>
            <div className="d-flex my-1 align-items-center">
              {/* page title */}
              <h3 className="mb-0">
                <UserPicture user={pageData.lastUpdateUser} />
                <span className="mx-2">{dPagePath.latter}</span>
              </h3>
              {/* page meta */}
              <div className="d-flex mx-2">
                <PageListMeta page={pageData} bookmarkCount={pageMeta.bookmarkCount} />
              </div>
              {/* doropdown icon includes page control buttons */}
              <div className="ml-auto">
                <PageItemControl page={pageData} />
              </div>
            </div>
            <div className="my-2">
              <Clamp
                lines={2}
              >
                {pageMeta.elasticSearchResult && <div className="mt-1" dangerouslySetInnerHTML={{ __html: pageMeta.elasticSearchResult.snippet }}></div>}
              </Clamp>
            </div>
          </div>
        </div>
        {/* TODO: adjust snippet position */}
      </a>
    </li>
  );
};

export default SearchResultListItem;
