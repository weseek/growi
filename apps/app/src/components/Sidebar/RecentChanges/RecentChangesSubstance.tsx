import React, {
  memo, useCallback, useEffect,
} from 'react';

import { isPopulated, type IPageHasId } from '@growi/core';
import { DevidedPagePath } from '@growi/core/dist/models';
import { UserPicture, FootstampIcon } from '@growi/ui/dist/components';
import Link from 'next/link';

import FormattedDistanceDate from '~/components/FormattedDistanceDate';
import InfiniteScroll from '~/components/InfiniteScroll';
import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import LinkedPagePath from '~/models/linked-page-path';
import { useSWRINFxRecentlyUpdated } from '~/stores/page-listing';
import loggerFactory from '~/utils/logger';

import { SidebarHeaderReloadButton } from '../SidebarHeaderReloadButton';

import styles from './RecentChangesSubstance.module.scss';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    locked = <span><i className="icon-lock ms-2" /></span>;
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
        className="grw-tag-label badge bg-primary mr-2 small"
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
        <div className="flex-grow-1 ms-2">
          { !dPagePath.isRoot && <FormerLink /> }
          <h5 className={isSmall ? 'my-0 text-truncate' : 'my-2'}>
            <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
            {locked}
          </h5>
          {!isSmall && (
            <div className="grw-tag-labels mt-1 mb-2">
              { tagElements }
            </div>
          )}
          <PageItemLower page={page} />
        </div>
      </div>
    </li>
  );
});
PageItem.displayName = 'PageItem';


type HeaderProps = {
  isSmall: boolean,
  onSizeChange: (isSmall: boolean) => void,
}

const PER_PAGE = 20;
export const RecentChangesHeader = ({ isSmall, onSizeChange }: HeaderProps): JSX.Element => {

  const { mutate } = useSWRINFxRecentlyUpdated(PER_PAGE, { suspense: true });

  const retrieveSizePreferenceFromLocalStorage = useCallback(() => {
    if (window.localStorage.isRecentChangesSidebarSmall === 'true') {
      onSizeChange(true);
    }
  }, [onSizeChange]);

  const changeSizeHandler = useCallback((e) => {
    onSizeChange(e.target.checked);
    window.localStorage.setItem('isRecentChangesSidebarSmall', e.target.checked);
  }, [onSizeChange]);

  // componentDidMount
  useEffect(() => {
    retrieveSizePreferenceFromLocalStorage();
  }, [retrieveSizePreferenceFromLocalStorage]);

  return (
    <>
      <SidebarHeaderReloadButton onClick={() => mutate()} />
      <div className="d-flex align-items-center">
        <div className={`grw-recent-changes-resize-button ${styles['grw-recent-changes-resize-button']} custom-control custom-switch ms-1`}>
          <input
            id="recentChangesResize"
            className="custom-control-input"
            type="checkbox"
            checked={isSmall}
            onChange={changeSizeHandler}
          />
          <label className="custom-control-label" htmlFor="recentChangesResize" />
        </div>
      </div>
    </>
  );
};

type ContentProps = {
  isSmall: boolean,
}

export const RecentChangesContent = ({ isSmall }: ContentProps): JSX.Element => {
  const swrInifinitexRecentlyUpdated = useSWRINFxRecentlyUpdated(PER_PAGE, { suspense: true });
  const { data } = swrInifinitexRecentlyUpdated;

  const isEmpty = data?.[0]?.pages.length === 0;
  const isReachingEnd = isEmpty || (data != null && data[data.length - 1]?.pages.length < PER_PAGE);

  return (
    <div className="grw-recent-changes py-3">
      <ul className="list-group list-group-flush">
        <InfiniteScroll
          swrInifiniteResponse={swrInifinitexRecentlyUpdated}
          isReachingEnd={isReachingEnd}
        >
          { data != null && data.map(apiResult => apiResult.pages).flat()
            .map(page => (
              <PageItem key={page._id} page={page} isSmall={isSmall} />
            ))
          }
        </InfiniteScroll>
      </ul>
    </div>
  );
};
