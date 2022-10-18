import React, { FC, memo } from 'react';

import { DevidedPagePath, IPageHasId } from '^/../core/src';
import { useTranslation } from 'next-i18next';

import LinkedPagePath from '~/models/linked-page-path';
import { useSWRInifinitexPageList } from '~/stores/page-listing';
import { useCustomSidebarOptions } from '~/stores/renderer';

import PagePathHierarchicalLink from '../PagePathHierarchicalLink';

import InfiniteScroll from './InfiniteScroll';


type PageItemProps = {
  page: IPageHasId,
}

const Database: FC = () => {
  const PER_PAGE = 20;
  const { t } = useTranslation();
  const { data: rendererOptions } = useCustomSidebarOptions();
  const swr = useSWRInifinitexPageList('/database');
  const isEmpty = swr.data?.length === 0;
  const isReachingEnd = isEmpty || (swr.data && swr.data[swr.data.length - 1]?.length < PER_PAGE);

  if (rendererOptions == null) {
    return <></>;
  }

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
          <div className="flex-grow-1 ml-2">
            { !dPagePath.isRoot && <FormerLink /> }
            <h5 className="my-0 text-truncate">
              <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
              {locked}
            </h5>
          </div>
        </div>
      </li>
    );
  });
  SmallPageItem.displayName = 'SmallPageItem';

  return (
    <div>
      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0 text-nowrap">{t('Database')}</h3>
        <button type="button" className="btn btn-sm ml-auto grw-btn-reload" onClick={() => swr.mutate()}>
          <i className="icon icon-reload"></i>
        </button>
      </div>
      <div className="p-3">
        <ul className="list-group list-group-flush">
          <InfiniteScroll
            swrInifiniteResponse={swr}
            isReachingEnd={isReachingEnd}
          >
            {pages => pages.map(page => <SmallPageItem key={page._id} page={page} />)}
          </InfiniteScroll>
        </ul>
      </div>
    </div>
  );
};

export default Database;
