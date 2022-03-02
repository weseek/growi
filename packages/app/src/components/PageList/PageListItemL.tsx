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


import { ISelectable } from '~/client/interfaces/selectable-all';
import { bookmark, unbookmark } from '~/client/services/page-operation';
import { useIsDeviceSmallerThanLg } from '~/stores/ui';
import {
  usePageRenameModal, usePageDuplicateModal, usePageDeleteModal, usePutBackPageModal,
} from '~/stores/modal';
import {
  IPageInfoAll, IPageInfoForEntity, IPageInfoForListing, IPageWithMeta, isIPageInfoForListing,
} from '~/interfaces/page';
import { IPageSearchMeta, isIPageSearchMeta } from '~/interfaces/search';
import { OnDuplicatedFunction, OnRenamedFunction, OnDeletedFunction } from '~/interfaces/ui';
import LinkedPagePath from '~/models/linked-page-path';

import { ForceHideMenuItems, PageItemControl } from '../Common/Dropdown/PageItemControl';
import PagePathHierarchicalLink from '../PagePathHierarchicalLink';

type Props = {
  page: IPageWithMeta<IPageInfoForEntity> | IPageWithMeta<IPageSearchMeta> | IPageWithMeta<IPageInfoForListing & IPageSearchMeta>,
  isSelected?: boolean, // is item selected(focused)
  isEnableActions?: boolean,
  forceHideMenuItems?: ForceHideMenuItems,
  showPageUpdatedTime?: boolean, // whether to show page's updated time at the top-right corner of item
  onCheckboxChanged?: (isChecked: boolean, pageId: string) => void,
  onClickItem?: (pageId: string) => void,
  onPageDuplicated?: OnDuplicatedFunction,
  onPageRenamed?: OnRenamedFunction,
  onPageDeleted?: OnDeletedFunction,
}

const PageListItemLSubstance: ForwardRefRenderFunction<ISelectable, Props> = (props: Props, ref): JSX.Element => {
  const {
    // todo: refactoring variable name to clear what changed
    page: { data: pageData, meta: pageMeta }, isSelected, isEnableActions,
    forceHideMenuItems,
    showPageUpdatedTime,
    onClickItem, onCheckboxChanged, onPageDuplicated, onPageRenamed, onPageDeleted,
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
  const { open: openPutBackPageModal } = usePutBackPageModal();

  const elasticSearchResult = isIPageSearchMeta(pageMeta) ? pageMeta.elasticSearchResult : null;
  const revisionShortBody = isIPageInfoForListing(pageMeta) ? pageMeta.revisionShortBody : null;

  const dPagePath: DevidedPagePath = new DevidedPagePath(elasticSearchResult?.highlightedPath || pageData.path, true);
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

  const bookmarkMenuItemClickHandler = async(_pageId: string, _newValue: boolean): Promise<void> => {
    const bookmarkOperation = _newValue ? bookmark : unbookmark;
    await bookmarkOperation(_pageId);
  };

  const duplicateMenuItemClickHandler = useCallback(() => {
    const page = {
      pageId: pageData._id,
      path: pageData.path,
    };
    openDuplicateModal(page, { onDuplicated: onPageDuplicated });
  }, [onPageDuplicated, openDuplicateModal, pageData._id, pageData.path]);

  const renameMenuItemClickHandler = useCallback((_id: string, pageInfo: IPageInfoAll | undefined) => {
    const page = { data: pageData, meta: pageInfo };
    openRenameModal(page, { onRenamed: onPageRenamed });
  }, [pageData, onPageRenamed, openRenameModal]);


  const deleteMenuItemClickHandler = useCallback((_id: string, pageInfo: IPageInfoAll | undefined) => {
    const pageToDelete = { data: pageData, meta: pageInfo };

    // open modal
    openDeleteModal([pageToDelete], { onDeleted: onPageDeleted });
  }, [pageData, openDeleteModal, onPageDeleted]);

  const revertMenuItemClickHandler = useCallback(() => {
    const { _id: pageId, path } = pageData;
    openPutBackPageModal({ pageId, path });
  }, [openPutBackPageModal, pageData]);

  const styleListGroupItem = (!isDeviceSmallerThanLg && onClickItem != null) ? 'list-group-item-action' : '';
  // background color of list item changes when class "active" exists under 'list-group-item'
  const styleActive = !isDeviceSmallerThanLg && isSelected ? 'active' : '';

  const shouldDangerouslySetInnerHTMLForPaths = elasticSearchResult != null && elasticSearchResult.highlightedPath.length > 0;

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
              <PagePathHierarchicalLink
                linkedPagePath={linkedPagePathFormer}
                shouldDangerouslySetInnerHTML={shouldDangerouslySetInnerHTMLForPaths}
              />
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
                    {shouldDangerouslySetInnerHTMLForPaths
                      ? (
                        <a
                          className="page-segment"
                          href={encodeURI(urljoin('/', pageData._id))}
                          // eslint-disable-next-line react/no-danger
                          dangerouslySetInnerHTML={{ __html: linkedPagePathLatter.pathName }}
                        >
                        </a>
                      )
                      : <a className="page-segment" href={encodeURI(urljoin('/', pageData._id))}>{linkedPagePathLatter.pathName}</a>
                    }
                  </span>
                </span>
              </Clamp>

              {/* page meta */}
              <div className="d-none d-md-flex py-0 px-1">
                <PageListMeta page={pageData} bookmarkCount={pageMeta?.bookmarkCount} shouldSpaceOutIcon />
              </div>

              {/* doropdown icon includes page control buttons */}
              <div className="item-control ml-auto">
                <PageItemControl
                  pageId={pageData._id}
                  pageInfo={isIPageInfoForListing(pageMeta) ? pageMeta : undefined}
                  isEnableActions={isEnableActions}
                  forceHideMenuItems={forceHideMenuItems}
                  onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
                  onClickRenameMenuItem={renameMenuItemClickHandler}
                  onClickDuplicateMenuItem={duplicateMenuItemClickHandler}
                  onClickDeleteMenuItem={deleteMenuItemClickHandler}
                  onClickRevertMenuItem={revertMenuItemClickHandler}
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
