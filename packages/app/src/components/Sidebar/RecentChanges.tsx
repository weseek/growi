import React, {
  memo, useCallback, useEffect, useState,
} from 'react';

import { DevidedPagePath, isPopulated } from '@growi/core';
import { UserPicture, FootstampIcon } from '@growi/ui';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import { IPageHasId } from '~/interfaces/page';
import LinkedPagePath from '~/models/linked-page-path';
import { useSWRInifinitexRecentlyUpdated } from '~/stores/page-listing';
import loggerFactory from '~/utils/logger';

import FormattedDistanceDate from '../FormattedDistanceDate';

import InfiniteScroll from './InfiniteScroll';

import TagLabelsStyles from '../Page/TagLabels.module.scss';
import styles from './RecentChanges.module.scss';


const logger = loggerFactory('growi:History');

type PageItemProps = {
  page: IPageHasId,
}

const PageItemLower = memo(({ page }: PageItemProps): JSX.Element => {
  return (
    <div className="d-flex justify-content-between grw-recent-changes-item-lower pt-1">
      <div className="d-flex">
        <div className="footstamp-icon mr-1 d-inline-block"><FootstampIcon /></div>
        <div className="mr-2 grw-list-counts d-inline-block">{page.seenUsers.length}</div>
        <div className="icon-bubble mr-1 d-inline-block"></div>
        <div className="mr-2 grw-list-counts d-inline-block">{page.commentCount}</div>
      </div>
      <div className="grw-formatted-distance-date small mt-auto" data-hide-in-vrt>
        <FormattedDistanceDate id={page._id} date={page.updatedAt} />
      </div>
    </div>
  );
});
PageItemLower.displayName = 'PageItemLower';


const LargePageItem = memo(({ page }: PageItemProps): JSX.Element => {
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
      <Link key={tag.name} href={`/_search?q=tag:${tag.name}`} prefetch={false}>
        <a className="grw-tag-label badge badge-secondary mr-2 small">
          {tag.name}
        </a>
      </Link>
    );
  });

  return (
    <li className={`list-group-item ${styles['list-group-item']} py-3 px-0`}>
      <div className="d-flex w-100">
        <UserPicture user={page.lastUpdateUser} size="md" noTooltip />
        <div className="flex-grow-1 ml-2">
          { !dPagePath.isRoot && <FormerLink /> }
          <h5 className="my-2">
            <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
            {locked}
          </h5>
          <div className="grw-tag-labels mt-1 mb-2">
            { tagElements }
          </div>
          <PageItemLower page={page} />
        </div>
      </div>
    </li>
  );
});
LargePageItem.displayName = 'LargePageItem';


const SmallPageItem = memo(({ page }: PageItemProps): JSX.Element => {
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

  return (
    <li className="list-group-item py-2 px-0">
      <div className="d-flex w-100">
        <UserPicture user={page.lastUpdateUser} size="md" noTooltip />
        <div className="flex-grow-1 ml-2">
          { !dPagePath.isRoot && <FormerLink /> }
          <h5 className="my-0 text-truncate">
            <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
            {locked}
          </h5>
          <PageItemLower page={page} />
        </div>
      </div>
    </li>
  );
});
SmallPageItem.displayName = 'SmallPageItem';

const RecentChanges = (): JSX.Element => {
  const PER_PAGE = 20;
  const { t } = useTranslation();
  const swr = useSWRInifinitexRecentlyUpdated();
  const [isRecentChangesSidebarSmall, setIsRecentChangesSidebarSmall] = useState(false);
  const isEmpty = swr.data?.[0].length === 0;
  const isReachingEnd = isEmpty || (swr.data && swr.data[swr.data.length - 1]?.length < PER_PAGE);
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
    <div data-testid="grw-recent-changes">
      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0  text-nowrap">{t('Recent Changes')}</h3>
        <button type="button" className="btn btn-sm ml-auto grw-btn-reload" onClick={() => swr.mutate()}>
          <i className="icon icon-reload"></i>
        </button>
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
      <div className="grw-recent-changes p-3">
        <ul className="list-group list-group-flush">
          <InfiniteScroll
            swrInifiniteResponse={swr}
            isReachingEnd={isReachingEnd}
          >
            {pages => pages.map(page => (
              isRecentChangesSidebarSmall
                ? <SmallPageItem key={page._id} page={page} />
                : <LargePageItem key={page._id} page={page} />
            ))
            }
          </InfiniteScroll>
        </ul>
      </div>
    </div>
  );

};
export default RecentChanges;
