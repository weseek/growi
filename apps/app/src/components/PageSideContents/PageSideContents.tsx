import React, { useCallback } from 'react';

import { getIdForRef, type IPageHasId, type IPageInfoForOperation } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { scroller } from 'react-scroll';

import { useUpdateStateAfterSave } from '~/client/services/page-operation';
import { apiPost } from '~/client/util/apiv1-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';
import { useDescendantsPageListModal } from '~/stores/modal';
import { useSWRxPageInfo, useSWRxTagsInfo } from '~/stores/page';
import { useIsAbleToShowTagLabel } from '~/stores/ui';

import { ContentLinkButtons } from '../ContentLinkButtons';
import { PageTagsSkeleton } from '../PageTags';
import TableOfContents from '../TableOfContents';

import { PageAccessoriesControl } from './PageAccessoriesControl';

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

  const tagsUpdatedHandler = useCallback(async(newTags: string[]) => {
    try {
      await apiPost('/tags.update', { pageId, revisionId, tags: newTags });

      updateStateAfterSave?.();

      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err);
    }

  }, [pageId, revisionId, updateStateAfterSave]);

  if (!showTagLabel) {
    return <></>;
  }

  const isTagLabelsDisabled = !!isGuestUser || !!isReadOnlyUser;

  return (
    <div className="grw-taglabels-container">
      { tagsInfoData?.tags != null
        ? <PageTags tags={tagsInfoData.tags} isTagLabelsDisabled={isTagLabelsDisabled ?? false} tagsUpdateInvoked={tagsUpdatedHandler} />
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

      <div className={`${styles['grw-page-accessories-controls']} d-flex flex-column gap-2 d-print-none`}>
        {/* Page list */}
        {!isSharedUser && (
          <div className="d-flex" data-testid="pageListButton">
            <PageAccessoriesControl
              icon={<span className="material-symbols-outlined">subject</span>}
              label={t('page_list')}
              // Do not display CountBadge if '/trash/*': https://github.com/weseek/growi/pull/7600
              count={!isTrash && pageInfo != null ? (pageInfo as IPageInfoForOperation).descendantCount : undefined}
              onClick={() => openDescendantPageListModal(pagePath)}
            />
          </div>
        )}

        {/* Comments */}
        {!isTopPagePath && (
          <div className="d-flex" data-testid="page-comment-button">
            <PageAccessoriesControl
              icon={<span className="material-symbols-outlined">chat</span>}
              label="Comments"
              count={pageInfo != null ? (pageInfo as IPageInfoForOperation).commentCount : undefined}
              onClick={() => scroller.scrollTo('comments-container', { smooth: false, offset: -120 })}
            />
          </div>
        )}
      </div>

      <div className="d-none d-xl-block">
        <TableOfContents />
        {isUsersHomepagePath && <ContentLinkButtons author={page?.creator} />}
      </div>
    </>
  );
};
