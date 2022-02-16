import React, {
  forwardRef,
  ForwardRefRenderFunction, memo, useCallback, useImperativeHandle, useRef,
} from 'react';

import { CustomInput } from 'reactstrap';

import Clamp from 'react-multiline-clamp';
import { format } from 'date-fns';
import urljoin from 'url-join';

import { UserPicture, PageListMeta } from '@growi/ui';
import { DevidedPagePath } from '@growi/core';
import { useIsDeviceSmallerThanLg } from '~/stores/ui';
import { usePageRenameModal, usePageDuplicateModal, usePageDeleteModal } from '~/stores/modal';
import {
  IPageInfoAll, IPageWithMeta, isIPageInfoForEntity, isIPageInfoForListing,
} from '~/interfaces/page';
import { IPageSearchMeta, isIPageSearchMeta } from '~/interfaces/search';

import { PageItemControl } from '../Common/Dropdown/PageItemControl';
import LinkedPagePath from '~/models/linked-page-path';
import PagePathHierarchicalLink from '../PagePathHierarchicalLink';
import { ISelectable } from '~/client/interfaces/selectable-all';

type Props = {
  page: IPageWithMeta | IPageWithMeta<IPageInfoAll & IPageSearchMeta>,
  isSelected?: boolean, // is item selected(focused)
  isEnableActions?: boolean,
  showPageUpdatedTime?: boolean, // whether to show page's updated time at the top-right corner of item
  onCheckboxChanged?: (isChecked: boolean, pageId: string) => void,
  onClickItem?: (pageId: string) => void,
}

const PageListItemLSubstance: ForwardRefRenderFunction<ISelectable, Props> = (props: Props, ref): JSX.Element => {
  const {
    // todo: refactoring variable name to clear what changed
    page: { pageData, pageMeta }, isSelected, isEnableActions,
    showPageUpdatedTime,
    onClickItem, onCheckboxChanged,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  // publish ISelectable methods
  useImperativeHandle(ref, () => ({
    select: () => {
      const input = inputRef.current;
      if (input != null) {
        input.checked = true;
      }
    },
    deselect: () => {
      const input = inputRef.current;
      if (input != null) {
        input.checked = false;
      }
    },
  }));

  const { data: isDeviceSmallerThanLg } = useIsDeviceSmallerThanLg();
  const { open: openDuplicateModal } = usePageDuplicateModal();
  const { open: openRenameModal } = usePageRenameModal();
  const { open: openDeleteModal } = usePageDeleteModal();

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

  const duplicateMenuItemClickHandler = useCallback(() => {
    const { _id: pageId, path } = pageData;
    openDuplicateModal(pageId, path);
  }, [openDuplicateModal, pageData]);

  const renameMenuItemClickHandler = useCallback(() => {
    const { _id: pageId, revision: revisionId, path } = pageData;
    openRenameModal(pageId, revisionId as string, path);
  }, [openRenameModal, pageData]);

  const deleteMenuItemClickHandler = useCallback(() => {
    const { _id: pageId, revision: revisionId, path } = pageData;
    openDeleteModal([{ pageId, revisionId: revisionId as string, path }]);
  }, [openDeleteModal, pageData]);

  const styleListGroupItem = (!isDeviceSmallerThanLg && onClickItem != null) ? 'list-group-item-action' : '';
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
          {onCheckboxChanged != null && (
            <div className="d-flex align-items-center justify-content-center pl-md-2 pl-3">
              <CustomInput
                type="checkbox"
                id={`cbSelect-${pageData._id}`}
                data-testid="cb-select"
                innerRef={inputRef}
                onChange={(e) => { onCheckboxChanged(e.target.checked, pageData._id) }}
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
                  {/* Use permanent links to care for pages with the same name (Cannot use page path url) */}
                  <span className="grw-page-path-hierarchical-link text-break">
                    <a className="page-segment" href={encodeURI(urljoin('/', pageData._id))}>{linkedPagePathLatter.pathName}</a>
                  </span>
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
                  onClickDeleteMenuItem={deleteMenuItemClickHandler}
                  onClickRenameMenuItem={renameMenuItemClickHandler}
                  isEnableActions={isEnableActions}
                  onClickDuplicateMenuItem={duplicateMenuItemClickHandler}
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
};

export const PageListItemL = memo(forwardRef(PageListItemLSubstance));
