import React, { FC, memo, useCallback } from 'react';

import Clamp from 'react-multiline-clamp';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';
import { pagePathUtils, DevidedPagePath } from '@growi/core';
import { useIsDeviceSmallerThanLg } from '~/stores/ui';

import { IPageSearchResultData } from '../../interfaces/search';
import PageItemControl from '../Common/Dropdown/PageItemControl';

const { isTopPage } = pagePathUtils;

type Props = {
  page: IPageSearchResultData,
  isSelected: boolean, // is item selected(focused)
  isChecked: boolean, // is checkbox of item checked
  isEnableActions: boolean,
  shortBody?: string
  showPageUpdatedTime?: boolean, // whether to show page's updated time at the top-right corner of item
  onClickCheckbox?: (pageId: string) => void,
  onClickSearchResultItem?: (pageId: string) => void,
  onClickDeleteButton?: (pageId: string) => void,
}

const PageListItem: FC<Props> = memo((props:Props) => {
  const {
    // todo: refactoring variable name to clear what changed
    page: { pageData, pageMeta }, isSelected, onClickSearchResultItem, onClickCheckbox, isChecked, isEnableActions, shortBody,
    showPageUpdatedTime,
  } = props;

  const { data: isDeviceSmallerThanLg } = useIsDeviceSmallerThanLg();

  const pagePath: DevidedPagePath = new DevidedPagePath(pageData.path, true);

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

  // click event handler
  const clickHandler = useCallback(() => {
    // do nothing if mobile
    if (isDeviceSmallerThanLg) {
      return;
    }

    if (onClickSearchResultItem != null) {
      onClickSearchResultItem(pageData._id);
    }
  }, [isDeviceSmallerThanLg, onClickSearchResultItem, pageData._id]);

  // background color of list item changes when class "active" exists under 'grw-search-result-item'
  const responsiveListStyleClass = `${isDeviceSmallerThanLg ? '' : `${isSelected ? 'active' : ''}`}`;
  return (
    <li
      key={pageData._id}
      className={`w-100 grw-search-result-item search-result-list
        ${onClickCheckbox != null ? 'list-group-item-action border-bottom' : 'list-group-item p-0'}
        ${responsiveListStyleClass}`
      }
    >
      <div
        className="h-100 text-break"
        onClick={clickHandler}
      >
        <div className="d-flex h-100">
          {/* checkbox */}
          {onClickCheckbox != null && (
            <div className="form-check d-flex align-items-center justify-content-center px-md-2 pl-3 pr-2 search-item-checkbox">
              <input
                className="form-check-input position-relative m-0"
                type="checkbox"
                id="flexCheckDefault"
                onChange={() => { onClickCheckbox(pageData._id) }}
                checked={isChecked}
              />
            </div>
          )}
          <div className="search-item-text p-md-3 pl-2 py-3 pr-3 flex-grow-1">
            {/* page path */}
            <h6 className="mb-1 py-1 d-flex">
              <a className="d-inline-block" href={pagePath.isRoot ? pagePath.latter : pagePath.former}>
                <i className="icon-fw icon-home"></i>
                {pagePathElem}
              </a>
              {showPageUpdatedTime && (<p className="ml-auto mb-0 mr-4 list-item-updated-time">Updated: 0000/00/00 00:00:00</p>)}
            </h6>
            <div className="d-flex align-items-center mb-2">
              {/* Picture */}
              <span className="mr-2 d-none d-md-block">
                <UserPicture user={pageData.lastUpdateUser} size="custom-md" />
              </span>
              {/* page title */}
              <Clamp lines={1}>
                <span className="py-1 h5 mr-2 mb-0">
                  <a href={`/${pageData._id}`}>{pageTitle}</a>
                </span>
              </Clamp>

              {/* page meta */}
              <div className="d-none d-md-flex item-meta py-0 px-1">
                <PageListMeta page={pageData} bookmarkCount={pageMeta.bookmarkCount} shouldSpaceOutIcon />
              </div>
              {/* doropdown icon includes page control buttons */}
              <div className="item-control ml-auto">
                <PageItemControl
                  page={pageData}
                  onClickDeleteButtonHandler={props.onClickDeleteButton}
                  isEnableActions={isEnableActions}
                  isDeletable={!isTopPage(pageData.path)}
                  // Todo: add onClickRenameButtonHandler
                />
              </div>
            </div>
            <div className="grw-search-result-list-snippet py-1">
              <Clamp lines={2}>
                {
                  pageMeta.elasticSearchResult != null && pageMeta.elasticSearchResult?.snippet.length !== 0 ? (
                    <div dangerouslySetInnerHTML={{ __html: pageMeta.elasticSearchResult.snippet }}></div>
                  ) : (
                    <div>{ shortBody != null ? shortBody : 'Loading ...' }</div> // TODO: improve indicator
                  )
                }
              </Clamp>
            </div>
          </div>
        </div>
        {/* TODO: adjust snippet position */}
      </div>
    </li>
  );
});

export default PageListItem;
