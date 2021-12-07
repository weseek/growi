import React, { FC } from 'react';

import Clamp from 'react-multiline-clamp';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';
import { DevidedPagePath } from '@growi/core';

import { IPageSearchResultData } from '../../interfaces/search';
import PageItemControl from '../Common/Dropdown/PageItemControl';


type Props = {
  page: IPageSearchResultData,
  isSelected: boolean,
  isChecked: boolean,
  onClickCheckbox?: (pageId: string) => void,
  onClickSearchResultItem?: (pageId: string) => void,
  onClickDeleteButton?: (pageId: string) => void,
}

const SearchResultListItem: FC<Props> = (props:Props) => {
  const {
    // todo: refactoring variable name to clear what changed
    page: { pageData, pageMeta }, isSelected, onClickSearchResultItem, onClickCheckbox, isChecked,
  } = props;

  // Add prefix 'id_' in pageId, because scrollspy of bootstrap doesn't work when the first letter of id attr of target component is numeral.
  const pageId = `#${pageData._id}`;

  const isPathIncludedHtml = pageMeta.elasticSearchResult?.highlightedPath != null || pageData.path != null;
  const dPagePath = new DevidedPagePath(pageData.path, false, true);
  const pagePathElem = (
    <PagePathLabel
      path={pageMeta.elasticSearchResult?.highlightedPath || pageData.path}
      isFormerOnly
      isPathIncludedHtml={isPathIncludedHtml}
    />
  );

  return (
    <li key={pageData._id} className={`page-list-li search-page-item w-100 border-bottom px-4 list-group-item-action ${isSelected ? 'active' : ''}`}>
      <a
        className="d-block pt-3"
        href={pageId}
        onClick={() => onClickSearchResultItem != null && onClickSearchResultItem(pageData._id)}
      >
        <div className="d-flex">
          {/* checkbox */}
          <div className="form-check my-auto mr-3">
            <input
              className="form-check-input my-auto"
              type="checkbox"
              id="flexCheckDefault"
              onChange={() => {
                if (onClickCheckbox != null) {
                  onClickCheckbox(pageData._id);
                }
              }}
              checked={isChecked}
            />
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
                <PageItemControl page={pageData} onClickDeleteButton={props.onClickDeleteButton} />
              </div>
            </div>
            <div className="my-2">
              <Clamp
                lines={2}
              >
                {pageMeta.elasticSearchResult != null
                && <div className="mt-1" dangerouslySetInnerHTML={{ __html: pageMeta.elasticSearchResult.snippet }}></div>}
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
