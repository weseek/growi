import React from 'react';

import type { IPageHasId, IPageInfoForOperation } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';
import { Link } from 'react-scroll';

import { useDescendantsPageListModal } from '~/stores/modal';
import { useSWRxPageInfo } from '~/stores/page';

import CountBadge from './Common/CountBadge';
import { ContentLinkButtons } from './ContentLinkButtons';
import PageListIcon from './Icons/PageListIcon';
import TableOfContents from './TableOfContents';

import styles from './PageSideContents.module.scss';


const { isTopPage, isUsersHomepage, isTrashPage } = pagePathUtils;


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
      {/* Page list */}
      <div className={`grw-page-accessories-control ${styles['grw-page-accessories-control']}`}>
        {!isSharedUser && (
          <button
            type="button"
            className="btn btn-block btn-outline-secondary grw-btn-page-accessories rounded-pill d-flex justify-content-between align-items-center"
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
              : <div className='px-2'></div>}
          </button>
        )}
      </div>

      {/* Comments */}
      {!isTopPagePath && (
        <div className={`mt-2 grw-page-accessories-control ${styles['grw-page-accessories-control']}`}>
          <Link to={'page-comments'} offset={-120}>
            <button
              type="button"
              className="btn btn-block btn-outline-secondary grw-btn-page-accessories rounded-pill d-flex justify-content-between align-items-center"
              data-testid="page-comment-button"
            >
              <i className="icon-fw icon-bubbles grw-page-accessories-control-icon"></i>
              <span>Comments</span>
              { pageInfo != null
                ? <CountBadge count={(pageInfo as IPageInfoForOperation).commentCount} />
                : <div className='px-2'></div>}
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
