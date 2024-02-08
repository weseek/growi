import React, {
  memo, useCallback, useEffect,
} from 'react';

import {
  isPopulated, type IPageHasId,
} from '@growi/core';
import { DevidedPagePath } from '@growi/core/dist/models';
import { UserPicture } from '@growi/ui/dist/components';

import { useKeywordManager } from '~/client/services/search-operation';
import { PagePathHierarchicalLink } from '~/components/Common/PagePathHierarchicalLink';
import FormattedDistanceDate from '~/components/FormattedDistanceDate';
import InfiniteScroll from '~/components/InfiniteScroll';
import LinkedPagePath from '~/models/linked-page-path';
import { useSWRINFxRecentlyUpdated } from '~/stores/page-listing';
import loggerFactory from '~/utils/logger';

import { SidebarHeaderReloadButton } from '../SidebarHeaderReloadButton';

import styles from './RecentChangesSubstance.module.scss';

const formerLinkClass = styles['grw-former-link'];
const pageItemLowerClass = styles['grw-recent-changes-item-lower'];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = loggerFactory('growi:History');

type PageItemLowerProps = {
  page: IPageHasId,
}

type PageItemProps = PageItemLowerProps & {
  isSmall: boolean,
  onClickTag?: (tagName: string) => void,
}

const PageItemLower = memo(({ page }: PageItemLowerProps): JSX.Element => {
  return (
    <div className={`${pageItemLowerClass} d-flex justify-content-between grw-recent-changes-item-lower`}>
      <div className="d-flex align-items-center">
        <div className="">
          <span className="material-symbols-outlined p-0">footprint</span>
          <span className="grw-list-counts ms-1">{page.seenUsers.length}</span>
        </div>
        <div className="ms-2">
          <span className="material-symbols-outlined p-0">chat</span>
          <span className="grw-list-counts ms-1">{page.commentCount}</span>
        </div>
      </div>
      <div className="grw-formatted-distance-date mt-auto" data-vrt-blackout-datetime>
        <FormattedDistanceDate id={page._id} date={page.updatedAt} />
      </div>
    </div>
  );
});
PageItemLower.displayName = 'PageItemLower';

type PageTagsProps = PageItemProps;
const PageTags = memo((props: PageTagsProps): JSX.Element => {
  const { page, isSmall, onClickTag } = props;

  if (isSmall || (page.tags.length === 0)) {
    return <></>;
  }

  return (
    <>
      { page.tags.map((tag) => {
        if (!isPopulated(tag)) {
          return <></>;
        }
        return (
          <a
            key={tag.name}
            type="button"
            className="grw-tag badge me-2"
            onClick={() => onClickTag?.(tag.name)}
          >
            {tag.name}
          </a>
        );
      }) }
    </>
  );
});
PageTags.displayName = 'PageTags';

const PageItem = memo(({ page, isSmall, onClickTag }: PageItemProps): JSX.Element => {
  const dPagePath = new DevidedPagePath(page.path, false, true);
  const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
  const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
  const FormerLink = () => (
    <div className={`${formerLinkClass} ${isSmall ? 'text-truncate' : ''} small`}>
      <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} />
    </div>
  );

  let locked;
  if (page.grant !== 1) {
    locked = <span><i className="icon-lock ms-2" /></span>;
  }

  const isTagElementsRendered = !(isSmall || (page.tags.length === 0));

  return (
    <li className={`list-group-item ${styles['list-group-item']} py-2 px-0`}>
      <div className="d-flex w-100">

        <UserPicture user={page.lastUpdateUser} size="md" noTooltip />

        <div className="flex-grow-1 ms-2">
          <div className={`row ${isSmall ? 'gy-0' : 'gy-2'}`}>

            <div className="col-12">
              { !dPagePath.isRoot && <FormerLink /> }
            </div>

            <h6 className={`col-12 ${isSmall ? 'mb-0 text-truncate' : 'mb-0'}`}>
              <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
              {locked}
            </h6>

            { isTagElementsRendered && (
              <div className="col-12">
                <PageTags isSmall={isSmall} page={page} onClickTag={onClickTag} />
              </div>
            ) }

            <div className="col-12">
              <PageItemLower page={page} />
            </div>

          </div>
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
        <div className={`grw-recent-changes-resize-button ${styles['grw-recent-changes-resize-button']} form-check form-switch ms-1`}>
          <input
            id="recentChangesResize"
            className="form-check-input"
            type="checkbox"
            checked={isSmall}
            onChange={changeSizeHandler}
          />
          <label className="form-label form-check-label" htmlFor="recentChangesResize" />
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

  const { pushState } = useKeywordManager();

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
              <PageItem key={page._id} page={page} isSmall={isSmall} onClickTag={tagName => pushState(`tag:${tagName}`)} />
            ))
          }
        </InfiniteScroll>
      </ul>
    </div>
  );
};
