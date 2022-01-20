import React, { FC } from 'react';
import PagePathNav from '../PagePathNav';
import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../client/services/AppContainer';

type Props = {
  appContainer:AppContainer
  pageId: string,
  path: string,
  isCompactMode?: boolean,
}


const DuplicatingPageSubNavigation: FC<Props> = (props : Props) => {
  const {
    pageId, path, isCompactMode,
  } = props;

  return (
    <div className="shadow-sm search-result-content-nav">
      <div className={`grw-subnav container-fluid d-flex align-items-center justify-content-between ${isCompactMode ? 'grw-subnav-compact d-print-none' : ''}`}>
        <div className="grw-path-nav-container">
          <PagePathNav pageId={pageId} pagePath={path} isCompactMode={isCompactMode} />
        </div>
      </div>
    </div>
  );
};


/**
 * Wrapper component for using unstated
 */
const DuplicatingPageSubNavigationUnstatedWrapper = withUnstatedContainers(DuplicatingPageSubNavigation, [AppContainer]);

// wrapping tsx component returned by withUnstatedContainers to avoid type error when this component used in other tsx components.
const DuplicatingPageSubNavigationWrapper = (props) => {
  return <DuplicatingPageSubNavigationUnstatedWrapper {...props}></DuplicatingPageSubNavigationUnstatedWrapper>;
};
export default DuplicatingPageSubNavigationWrapper;
