import React, { FC, useEffect, useState } from 'react';
import PagePathNav from '../PagePathNav';
import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../client/services/AppContainer';
import TagLabels from '../Page/TagLabels';
import { toastSuccess, toastError } from '../../client/util/apiNotification';
import { apiPost } from '../../client/util/apiv1-client';

type Props = {
  appContainer:AppContainer
  pageId: string,
  path: string,
  isSignleLineMode?: boolean,
  isCompactMode?: boolean,
}

const TagLableWrapper = (props) => {
  return <TagLabels {...props}></TagLabels>;
};

const SearchResultContentSubNavigation: FC<Props> = (props : Props) => {
  const {
    appContainer, pageId, path, isCompactMode, isSignleLineMode,
  } = props;
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const f = async() => {
      const res : any = await appContainer.apiGet('/pages.getPageTag', { pageId });
      setTags(res.tags);
    };
    f();
  }, []);

  const tagsUpdatedHandler = async(newTags) => {
    try {
      const res : any = await apiPost('/tags.update', { pageId, tags: newTags });
      setTags(res.tags);
      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }
  };

  const { isSharedUser } = appContainer;
  return (
    <div className={`grw-subnav container-fluid d-flex align-items-center justify-content-between ${isCompactMode ? 'grw-subnav-compact d-print-none' : ''}`}>
      {/* Left side */}
      <div className="grw-path-nav-container">
        {!isSharedUser && !isCompactMode && (
          <div className="grw-taglabels-container">
            <TagLableWrapper tags={tags} tagsUpdateInvoked={tagsUpdatedHandler} />
          </div>
        )}
        <PagePathNav pageId={pageId} pagePath={path} isCompactMode={isCompactMode} isSingleLineMode={isSignleLineMode} />
      </div>
      {/* Right side */}
      <div className="d-flex">
        {/* TODO: refactor SubNavButtons in a way that it can be used independently from pageContainer
              TASK : #80481 https://estoc.weseek.co.jp/redmine/issues/80481
              CONDITION reference: https://dev.growi.org/5fabddf8bbeb1a0048bcb9e9
        */}
        {/* <SubnavButtons isCompactMode={isCompactMode} /> */}
      </div>
    </div>
  );
};


/**
 * Wrapper component for using unstated
 */
const SearchResultContentSubNavigationWrapper = withUnstatedContainers(SearchResultContentSubNavigation, [AppContainer]);


export default SearchResultContentSubNavigationWrapper;
