
import React from 'react';

import { DevidedPagePath } from '@growi/core';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import LinkedPagePath from '~/models/linked-page-path';
import { useSWRInifiniteBookmarkedPage } from '~/stores/bookmark';
import { useCurrentUser } from '~/stores/context';

import PagePathHierarchicalLink from '../PagePathHierarchicalLink';

import InfiniteScroll from './InfiniteScroll';


const BookmarksItem = ({ data }) => {
  const { page } = data;
  const dPagePath = new DevidedPagePath(page.path, false, true);
  const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);

  return (
    <li className="list-group-item py-3 px-0">
      <div className="d-flex w-100">
        <h5 className="my-0">
          <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
        </h5>
      </div>
    </li>
  );

};

BookmarksItem.propTypes = {
  data: PropTypes.any,
};

const Bookmarks = () : JSX.Element => {
  const { t } = useTranslation('');
  const { data: currentUser } = useCurrentUser();
  const swr = useSWRInifiniteBookmarkedPage(currentUser?._id);
  const isEmpty = swr.data?.[0].docs.length === 0;
  const isReachingEnd = isEmpty || (swr.data && swr.data[0].nextPage == null);

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Bookmarks')}</h3>
      </div>
      <div className="grw-bookmarks-list p-3">
        {isEmpty ? t('No bookmarks yet') : (
          <ul className="list-group list-group-flush">
            <InfiniteScroll
              swrInifiniteResponse={swr}
              isReachingEnd={isReachingEnd}
            >
              {paginationResult => paginationResult?.docs.map(data => (
                <BookmarksItem key={data._id} data={data} />
              ))
              }
            </InfiniteScroll>
          </ul>
        )}
      </div>
    </>
  );

};

export default Bookmarks;
