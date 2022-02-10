import React, { memo, useCallback } from 'react';

import Clamp from 'react-multiline-clamp';
import { format } from 'date-fns';

import { UserPicture, PageListMeta } from '@growi/ui';
import { DevidedPagePath } from '@growi/core';
import { useIsDeviceSmallerThanLg } from '~/stores/ui';
import {
  IPageInfoAll, IPageWithMeta, isIPageInfoForEntity, isIPageInfoForListing,
} from '~/interfaces/page';
import { IPageSearchMeta, isIPageSearchMeta } from '~/interfaces/search';

import { PageItemControl } from '../Common/Dropdown/PageItemControl';
import LinkedPagePath from '~/models/linked-page-path';
import PagePathHierarchicalLink from '../PagePathHierarchicalLink';

type Props = {
  page: IPageWithMeta | IPageWithMeta<IPageInfoAll & IPageSearchMeta>,
  isSelected?: boolean, // is item selected(focused)
  isCheckedAllItems?: boolean, // is checkbox of item checked
  isEnableActions?: boolean,
  showPageUpdatedTime?: boolean, // whether to show page's updated time at the top-right corner of item
  onClickCheckbox?: (pageId: string) => void,
  onClickItem?: (pageId: string) => void,
  onClickDeleteButton?: (pageId: string) => void,
}

export const PageListItemL = memo((props: Props): JSX.Element => {
  const {
    // todo: refactoring variable name to clear what changed
    page: { pageData, pageMeta }, isSelected, onClickItem, onClickCheckbox, isCheckedAllItems, isEnableActions,
    showPageUpdatedTime,
  } = props;

  const { data: isDeviceSmallerThanLg } = useIsDeviceSmallerThanLg();

  const elasticSearchResult = isIPageSearchMeta(pageMeta) ? pageMeta.elasticSearchResult : null;
  const revisionShortBody = isIPageInfoForListing(pageMeta) ? pageMeta.revisionShortBody : null;

  const dPagePath: DevidedPagePath = new DevidedPagePath(pageData.path, true);
  const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
  const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);

  const lastUpdateDate = format(new Date(pageData.updatedAt), 'yyyy/MM/dd HH:mm:ss');

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

  return (
    <li
      key={pageData._id}
      className={`list-group-item p-0 ${styleListGroupItem} ${styleActive}`}
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
                checked={isCheckedAllItems}
              />
            </div>
          )}

          <div className="flex-grow-1 p-md-3 pl-2 py-3 pr-3">
            <div className="d-flex justify-content-between">
              {/* page path */}
              <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} />
              { showPageUpdatedTime && (
                <span className="page-list-updated-at text-muted">Last update: {lastUpdateDate}</span>
              ) }
            </div>
            <div className="d-flex align-items-center mb-1">
              {/* Picture */}
              <span className="mr-2 d-none d-md-block">
                <UserPicture user={pageData.lastUpdateUser} size="md" />
              </span>
              {/* page title */}
              <Clamp lines={1}>
                <span className="h5 mb-0">
                  <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} />
                </span>
              </Clamp>

              {/* page meta */}
              { isIPageInfoForEntity(pageMeta) && (
                <div className="d-none d-md-flex py-0 px-1">
                  <PageListMeta page={pageData} bookmarkCount={pageMeta.bookmarkCount} shouldSpaceOutIcon />
                </div>
              ) }

              {/* doropdown icon includes page control buttons */}
              <div className="item-control ml-auto">
                <PageItemControl
                  pageId={pageData._id}
                  pageInfo={pageMeta}
                  onClickDeleteMenuItem={props.onClickDeleteButton}
                  isEnableActions={isEnableActions}
                />
              </div>
            </div>
            <div className="page-list-snippet py-1">
              <Clamp lines={2}>
                { elasticSearchResult != null && elasticSearchResult?.snippet.length > 0 && (
                  // eslint-disable-next-line react/no-danger
                  <div dangerouslySetInnerHTML={{ __html: elasticSearchResult.snippet }}></div>
                ) }
                { revisionShortBody != null && (
                  <div>{revisionShortBody}</div>
                ) }
              </Clamp>
            </div>
          </div>
        </div>
        {/* TODO: adjust snippet position */}
      </div>
    </li>
  );
});
