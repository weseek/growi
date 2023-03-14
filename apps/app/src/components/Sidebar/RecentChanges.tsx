import React, {
  memo, useCallback, useEffect, useState,
} from 'react';

import { DevidedPagePath, isPopulated } from '@growi/core';
import { FootstampIcon } from '@growi/ui/dist/components/FootstampIcon';
import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import { IPageHasId } from '~/interfaces/page';
import LinkedPagePath from '~/models/linked-page-path';
import { useSWRINFxRecentlyUpdated } from '~/stores/page-listing';
import loggerFactory from '~/utils/logger';

import FormattedDistanceDate from '../FormattedDistanceDate';
import InfiniteScroll from '../InfiniteScroll';

import { SidebarHeaderReloadButton } from './SidebarHeaderReloadButton';
import RecentChangesContentSkeleton from './Skeleton/RecentChangesContentSkeleton';

import styles from './RecentChanges.module.scss';


const logger = loggerFactory('growi:History');

type PageItemLowerProps = {
  page: IPageHasId,
}

type PageItemProps = PageItemLowerProps & {
  isSmall: boolean
}

const PageItemLower = memo(({ page }: PageItemLowerProps): JSX.Element => {
  return (
    <div className="d-flex justify-content-between grw-recent-changes-item-lower pt-1">
      <div className="d-flex">
        <div className="footstamp-icon mr-1 d-inline-block"><FootstampIcon /></div>
        <div className="mr-2 grw-list-counts d-inline-block">{page.seenUsers.length}</div>
        <div className="icon-bubble mr-1 d-inline-block"></div>
        <div className="mr-2 grw-list-counts d-inline-block">{page.commentCount}</div>
      </div>
      <div className="grw-formatted-distance-date small mt-auto" data-vrt-blackout-datetime>
        <FormattedDistanceDate id={page._id} date={page.updatedAt} />
      </div>
    </div>
  );
});
PageItemLower.displayName = 'PageItemLower';

const PageItem = memo(({ page, isSmall }: PageItemProps): JSX.Element => {
  const dPagePath = new DevidedPagePath(page.path, false, true);
  const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
  const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
  const FormerLink = () => (
    <div className="grw-page-path-text-muted-container small">
      <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} />
    </div>
  );

  let locked;
  if (page.grant !== 1) {
    locked = <span><i className="icon-lock ml-2" /></span>;
  }

  const tags = page.tags;
  const tagElements = tags.map((tag) => {
    if (!isPopulated(tag)) {
      return <></>;
    }
    return (
      <Link
        key={tag.name}
        href={`/_search?q=tag:${tag.name}`}
        className="grw-tag-label badge badge-secondary mr-2 small"
        prefetch={false}
      >
        {tag.name}
      </Link>
    );
  });

  return (
    <li className={`list-group-item ${styles['list-group-item']} ${isSmall ? 'py-2' : 'py-3'} px-0`}>
      <div className="d-flex w-100">
        <UserPicture user={page.lastUpdateUser} size="md" noTooltip />
        <div className="flex-grow-1 ml-2">
          { !dPagePath.isRoot && <FormerLink /> }
          <h5 className={isSmall ? 'my-0 text-truncate' : 'my-2'}>
            <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
            {locked}
          </h5>
          {!isSmall && <div className="grw-tag-labels mt-1 mb-2">
            { tagElements }
          </div>}
          <PageItemLower page={page} />
        </div>
      </div>
    </li>
  );
});
PageItem.displayName = 'PageItem';

const RecentChanges = (): JSX.Element => {

  const PER_PAGE = 20;
  const { t } = useTranslation();
  const swrInifinitexRecentlyUpdated = useSWRINFxRecentlyUpdated(PER_PAGE);
  const {
    data, mutate, isLoading,
  } = swrInifinitexRecentlyUpdated;

  const [isRecentChangesSidebarSmall, setIsRecentChangesSidebarSmall] = useState(false);
  const isEmpty = data?.[0]?.pages.length === 0;
  const isReachingEnd = isEmpty || (data != null && data[data.length - 1]?.pages.length < PER_PAGE);

  const retrieveSizePreferenceFromLocalStorage = useCallback(() => {
    if (window.localStorage.isRecentChangesSidebarSmall === 'true') {
      setIsRecentChangesSidebarSmall(true);
    }
  }, []);

  const changeSizeHandler = useCallback((e) => {
    setIsRecentChangesSidebarSmall(e.target.checked);
    window.localStorage.setItem('isRecentChangesSidebarSmall', e.target.checked);
  }, []);

  // componentDidMount
  useEffect(() => {
    retrieveSizePreferenceFromLocalStorage();
  }, [retrieveSizePreferenceFromLocalStorage]);

  return (
    <div className="px-3" data-testid="grw-recent-changes">
      <div className="grw-sidebar-content-header py-3 d-flex">
        <h3 className="mb-0 text-nowrap">{t('Recent Changes')}</h3>
        <SidebarHeaderReloadButton onClick={() => mutate()}/>
        <div className="d-flex align-items-center">
          <div className={`grw-recent-changes-resize-button ${styles['grw-recent-changes-resize-button']} custom-control custom-switch ml-1`}>
            <input
              id="recentChangesResize"
              className="custom-control-input"
              type="checkbox"
              checked={isRecentChangesSidebarSmall}
              onChange={changeSizeHandler}
            />
            <label className="custom-control-label" htmlFor="recentChangesResize">
            </label>
          </div>
        </div>
      </div>
      {
        isLoading ? <RecentChangesContentSkeleton /> : (
          <div className="grw-recent-changes py-3">
            <ul className="list-group list-group-flush">
              <InfiniteScroll
                swrInifiniteResponse={swrInifinitexRecentlyUpdated}
                isReachingEnd={isReachingEnd}
              >
                { data != null && data.map(apiResult => apiResult.pages).flat()
                  .map(page => (
                    <PageItem key={page._id} page={page} isSmall={isRecentChangesSidebarSmall} />
                  ))
                }
              </InfiniteScroll>
            </ul>
          </div>
        )
      }
    </div>
  );

};
export default RecentChanges;
