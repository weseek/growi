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
  isEnableActions: boolean,
  onClickCheckbox?: (pageId: string) => void,
  onClickSearchResultItem?: (pageId: string) => void,
  onClickDeleteButton?: (pageId: string) => void,
}

const SearchResultListItem: FC<Props> = (props:Props) => {
  const {
    // todo: refactoring variable name to clear what changed
    page: { pageData, pageMeta }, isSelected, onClickSearchResultItem, onClickCheckbox, isChecked, isEnableActions,
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
    <li key={pageData._id} className={`page-list-li search-result-item w-100 list-group-item-action pl-2 ${isSelected ? 'active' : ''}`}>
      <a
        className="d-block h-100"
        href={pageId}
        onClick={() => onClickSearchResultItem != null && onClickSearchResultItem(pageData._id)}
      >
        <div className="d-flex">
          {/* checkbox */}
          <div className="form-check d-flex align-items-center justify-content-center">
            <input
              className="form-check-input"
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
          <div className="search-item-text p-3 flex-grow-1">
            {/* page path */}
            <div className="item-path">
              <i className="icon-fw icon-home"></i>
              {pagePathElem}
            </div>
            <div className="d-flex align-items-center mb-2">
              {/* Picture */}
              <span className="user-picture mr-2">
                <UserPicture user={pageData.lastUpdateUser} />
              </span>
              {/* page title */}
              <span className="item-title mr-2">{dPagePath.latter}</span>
              {/* page meta */}
              <div className="d-flex item-meta">
                <PageListMeta page={pageData} bookmarkCount={pageMeta.bookmarkCount} />
              </div>
              {/* doropdown icon includes page control buttons */}
              <div className="ml-auto">
                <PageItemControl page={pageData} onClickDeleteButton={props.onClickDeleteButton} isEnableActions={isEnableActions} />
              </div>
            </div>
            <div className="search-result-list-snippet">
              {
                pageMeta.elasticSearchResult != null && (
                  <Clamp lines={2}>
                    <div dangerouslySetInnerHTML={{ __html: pageMeta.elasticSearchResult.snippet }}></div>
                  </Clamp>
                )
              }
            </div>
          </div>
        </div>
        {/* TODO: adjust snippet position */}
      </a>
    </li>
  );
};

export default SearchResultListItem;
