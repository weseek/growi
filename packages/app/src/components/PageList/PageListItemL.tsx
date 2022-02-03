import React, { FC, memo, useCallback } from 'react';

import Clamp from 'react-multiline-clamp';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';
import { pagePathUtils, DevidedPagePath } from '@growi/core';
import { useIsDeviceSmallerThanLg } from '~/stores/ui';
import { IPageWithMeta } from '~/interfaces/page';
import { IPageSearchMeta, isIPageSearchMeta } from '~/interfaces/search';

import { AsyncPageItemControl } from '../Common/Dropdown/PageItemControl';

const { isTopPage, isUserNamePage } = pagePathUtils;

type Props = {
  page: IPageWithMeta | IPageWithMeta<IPageSearchMeta>,
  isSelected?: boolean, // is item selected(focused)
  isChecked?: boolean, // is checkbox of item checked
  isEnableActions?: boolean,
  shortBody?: string
  showPageUpdatedTime?: boolean, // whether to show page's updated time at the top-right corner of item
  onClickCheckbox?: (pageId: string) => void,
  onClickItem?: (pageId: string) => void,
  onClickDeleteButton?: (pageId: string) => void,
}

export const PageListItemL: FC<Props> = memo((props:Props) => {
  const {
    // todo: refactoring variable name to clear what changed
    page: { pageData, pageMeta }, isSelected, onClickItem, onClickCheckbox, isChecked, isEnableActions, shortBody,
    showPageUpdatedTime,
  } = props;

  const { data: isDeviceSmallerThanLg } = useIsDeviceSmallerThanLg();

  const pagePath: DevidedPagePath = new DevidedPagePath(pageData.path, true);

  const elasticSearchResult = isIPageSearchMeta(pageMeta) ? pageMeta.elasticSearchResult : null;

  const pageTitle = (
    <PagePathLabel
      path={elasticSearchResult?.highlightedPath || pageData.path}
      isLatterOnly
      isPathIncludedHtml={elasticSearchResult?.isHtmlInPath}
    >
    </PagePathLabel>
  );
  const pagePathElem = (
    <PagePathLabel
      path={elasticSearchResult?.highlightedPath || pageData.path}
      isFormerOnly
      isPathIncludedHtml={elasticSearchResult?.isHtmlInPath}
    />
  );

  // click event handler
  const clickHandler = useCallback(() => {
    // do nothing if mobile
    if (isDeviceSmallerThanLg) {
      return;
    }

    if (onClickItem != null) {
      onClickItem(pageData._id);
    }
  }, [isDeviceSmallerThanLg, onClickItem, pageData._id]);

  const styleListGroupItem = (!isDeviceSmallerThanLg && onClickCheckbox != null) ? 'list-group-item-action' : '';
  // background color of list item changes when class "active" exists under 'list-group-item'
  const styleActive = !isDeviceSmallerThanLg && isSelected ? 'active' : '';
  const styleBorder = onClickCheckbox != null ? 'border-bottom' : 'list-group-item p-0';

  return (
    <li
      key={pageData._id}
      className={`list-group-item p-0 ${styleListGroupItem} ${styleActive} ${styleBorder}}`
      }
    >
      <div
        className="text-break"
        onClick={clickHandler}
      >
        <div className="d-flex">
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
          <div className="flex-grow-1 p-md-3 pl-2 py-3 pr-3">
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
                <UserPicture user={pageData.lastUpdateUser} size="md" />
              </span>
              {/* page title */}
              <Clamp lines={1}>
                <span className="py-1 h5 mr-2 mb-0">
                  <a href={`/${pageData._id}`}>{pageTitle}</a>
                </span>
              </Clamp>

              {/* page meta */}
              <div className="d-none d-md-flex py-0 px-1">
                <PageListMeta page={pageData} bookmarkCount={pageMeta?.bookmarkCount} shouldSpaceOutIcon />
              </div>
              {/* doropdown icon includes page control buttons */}
              <div className="item-control ml-auto">
                {/* TODO: use PageItemControl with prefetched IPageInfo object */}
                <AsyncPageItemControl
                  pageId={pageData._id}
                  onClickDeleteMenuItem={props.onClickDeleteButton}
                  isEnableActions={isEnableActions}
                />
              </div>
            </div>
            <div className="page-list-snippet py-1">
              <Clamp lines={2}>
                {
                  elasticSearchResult != null && elasticSearchResult?.snippet.length !== 0 ? (
                    <div dangerouslySetInnerHTML={{ __html: elasticSearchResult.snippet }}></div>
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
