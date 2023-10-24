import React, { useCallback } from 'react';

import { getIdForRef, type IPageHasId, type IPageInfoForOperation } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Link } from 'react-scroll';

import { useUpdateStateAfterSave } from '~/client/services/page-operation';
import { apiPost } from '~/client/util/apiv1-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';
import { useDescendantsPageListModal } from '~/stores/modal';
import { useSWRxPageInfo, useSWRxTagsInfo } from '~/stores/page';
import { useIsAbleToShowTagLabel } from '~/stores/ui';

import CountBadge from '../Common/CountBadge';
import { ContentLinkButtons } from '../ContentLinkButtons';
import PageListIcon from '../Icons/PageListIcon';
import { PageTagsSkeleton } from '../PageTags';
import TableOfContents from '../TableOfContents';

import styles from './PageSideContents.module.scss';


const { isTopPage, isUsersHomepage, isTrashPage } = pagePathUtils;


const PageTags = dynamic(() => import('../PageTags').then(mod => mod.PageTags), {
  ssr: false,
  loading: PageTagsSkeleton,
});


type TagsProps = {
  pageId: string,
  revisionId: string,
}

const Tags = (props: TagsProps): JSX.Element => {
  const { pageId, revisionId } = props;

  const { data: tagsInfoData } = useSWRxTagsInfo(pageId);

  const { data: showTagLabel } = useIsAbleToShowTagLabel();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();

  const updateStateAfterSave = useUpdateStateAfterSave(pageId);

  if (!showTagLabel) {
    return <></>;
  }

  const isTagLabelsDisabled = !!isGuestUser || !!isReadOnlyUser;

  return (
    <div className="grw-taglabels-container">
      { tagsInfoData?.tags != null
        ? (
          <PageTags
            tags={tagsInfoData.tags}
            isTagLabelsDisabled={isTagLabelsDisabled ?? false}
            pageId={pageId}
          />
        )
        : <PageTagsSkeleton />
      }
    </div>
  );
};


export type PageSideContentsProps = {
  page: IPageHasId,
  isSharedUser?: boolean,
}

export const PageSideContents = (props: PageSideContentsProps): JSX.Element => {
  const { t } = useTranslation();

  const { open: openDescendantPageListModal } = useDescendantsPageListModal();

  const { page, isSharedUser } = props;

  const { data: pageInfo } = useSWRxPageInfo(page._id);

  const pagePath = page.path;
  const isTopPagePath = isTopPage(pagePath);
  const isUsersHomepagePath = isUsersHomepage(pagePath);
  const isTrash = isTrashPage(pagePath);


  return (
    <>
      {/* Tags */}
      <Tags pageId={page._id} revisionId={getIdForRef(page.revision)} />

      {/* Page list */}
      <div className={`grw-page-accessories-control ${styles['grw-page-accessories-control']}`}>
        {!isSharedUser && (
          <button
            type="button"
            className="btn btn-outline-secondary grw-btn-page-accessories rounded-pill d-flex justify-content-between align-items-center"
            onClick={() => openDescendantPageListModal(pagePath)}
            data-testid="pageListButton"
          >
            <div className="grw-page-accessories-control-icon">
              <PageListIcon />
            </div>
            {t('page_list')}

            {/* Do not display CountBadge if '/trash/*': https://github.com/weseek/growi/pull/7600 */}
            { !isTrash && pageInfo != null
              ? <CountBadge count={(pageInfo as IPageInfoForOperation).descendantCount} offset={1} />
              : <div className="px-2"></div>}
          </button>
        )}
      </div>

      {/* Comments */}
      {!isTopPagePath && (
        <div className={`mt-2 grw-page-accessories-control ${styles['grw-page-accessories-control']}`}>
          <Link to="page-comments" offset={-120}>
            <button
              type="button"
              className="btn btn-outline-secondary grw-btn-page-accessories rounded-pill d-flex justify-content-between align-items-center"
              data-testid="page-comment-button"
            >
              <i className="icon-fw icon-bubbles grw-page-accessories-control-icon"></i>
              <span>Comments</span>
              { pageInfo != null
                ? <CountBadge count={(pageInfo as IPageInfoForOperation).commentCount} />
                : <div className="px-2"></div>}
            </button>
          </Link>
        </div>
      )}

      <div className="d-none d-lg-block">
        <TableOfContents />
        {isUsersHomepagePath && <ContentLinkButtons author={page?.creator} />}
      </div>
    </>
  );
};
