import React, { FC } from 'react';

import Clamp from 'react-multiline-clamp';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';

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

  const pageTitle = (
    <PagePathLabel
      path={pageMeta.elasticSearchResult?.highlightedPath || pageData.path}
      isLatterOnly
      isPathIncludedHtml={pageMeta.elasticSearchResult?.isHtmlInPath}
    >
    </PagePathLabel>
  );
  const pagePathElem = (
    <PagePathLabel
      path={pageMeta.elasticSearchResult?.highlightedPath || pageData.path}
      isFormerOnly
      isPathIncludedHtml={pageMeta.elasticSearchResult?.isHtmlInPath}
    />
  );

  return (
    <li key={pageData._id} className={`page-list-li search-result-item list-group-item-action border-bottom ${isSelected ? 'active' : ''}`}>
      <a
        className="d-block h-100"
        href={pageId}
        onClick={() => onClickSearchResultItem != null && onClickSearchResultItem(pageData._id)}
      >
        <div className="d-flex h-100">
          {/* checkbox */}
          <div className="form-check d-flex align-items-center justify-content-center px-md-2 pl-3 pr-2 search-item-checkbox">
            <input
              className="form-check-input position-relative m-0"
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
          <div className="search-item-text p-md-3 pl-2 py-3 pr-3 flex-grow-1">
            {/* page path */}
            <h6 className="item-path mb-1">
              <i className="icon-fw icon-home"></i>
              {pagePathElem}
            </h6>
            <div className="d-flex align-items-center mb-2">
              {/* Picture */}
              <span className="user-picture mr-2 d-none d-md-block">
                <UserPicture user={pageData.lastUpdateUser} />
              </span>
              {/* page title */}
              <span className="item-title h5 mr-2 mb-0">
                {pageTitle}
              </span>
              {/* page meta */}
              <div className="d-none d-md-flex item-meta py-0 px-1">
                <PageListMeta page={pageData} bookmarkCount={pageMeta.bookmarkCount} />
              </div>
              {/* doropdown icon includes page control buttons */}
              <div className="item-control ml-auto">
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
