import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';
import { I18nextProvider } from 'react-i18next';

import loggerFactory from '~/utils/logger';

import ErrorBoundary from '../components/ErrorBoudary';
import Sidebar from '../components/Sidebar';
import SearchPage from '../components/SearchPage';
import TagsList from '../components/TagsList';
import DisplaySwitcher from '../components/Page/DisplaySwitcher';
import { defaultEditorOptions, defaultPreviewOptions } from '../components/PageEditor/OptionsSelector';
import Page from '../components/Page';
import PageComments from '../components/PageComments';
import PageContentFooter from '../components/PageContentFooter';
import PageTimeline from '../components/PageTimeline';
import CommentEditorLazyRenderer from '../components/PageComment/CommentEditorLazyRenderer';
import PageManagement from '../components/Page/PageManagement';
import ShareLinkAlert from '../components/Page/ShareLinkAlert';
import DuplicatedAlert from '../components/Page/DuplicatedAlert';
import RedirectedAlert from '../components/Page/RedirectedAlert';
import RenamedAlert from '../components/Page/RenamedAlert';
import TrashPageList from '../components/TrashPageList';
import TrashPageAlert from '../components/Page/TrashPageAlert';
import NotFoundPage from '../components/NotFoundPage';
import NotFoundAlert from '../components/Page/NotFoundAlert';
import ForbiddenPage from '../components/ForbiddenPage';
import PageStatusAlert from '../components/PageStatusAlert';
import RecentCreated from '../components/RecentCreated/RecentCreated';
import RecentlyCreatedIcon from '../components/Icons/RecentlyCreatedIcon';
import MyDraftList from '../components/MyDraftList/MyDraftList';
import BookmarkIcon from '../components/Icons/BookmarkIcon';
import BookmarkList from '../components/PageList/BookmarkList';
import LikerList from '../components/User/LikerList';
import Fab from '../components/Fab';
import PersonalSettings from '../components/Me/PersonalSettings';
import GrowiSubNavigation from '../components/Navbar/GrowiSubNavigation';
import GrowiSubNavigationSwitcher from '../components/Navbar/GrowiSubNavigationSwitcher';

import NavigationContainer from '~/client/services/NavigationContainer';
import PageContainer from '~/client/services/PageContainer';
import PageHistoryContainer from '~/client/services/PageHistoryContainer';
import RevisionComparerContainer from '~/client/services/RevisionComparerContainer';
import CommentContainer from '~/client/services/CommentContainer';
import EditorContainer from '~/client/services/EditorContainer';
import TagContainer from '~/client/services/TagContainer';
import PersonalContainer from '~/client/services/PersonalContainer';
import PageAccessoriesContainer from '~/client/services/PageAccessoriesContainer';

import { appContainer, componentMappings } from './base';

const logger = loggerFactory('growi:cli:app');

appContainer.initContents();

const { i18n } = appContainer;
const socketIoContainer = appContainer.getContainer('SocketIoContainer');

// create unstated container instance
const navigationContainer = new NavigationContainer(appContainer);
const pageContainer = new PageContainer(appContainer);
const pageHistoryContainer = new PageHistoryContainer(appContainer, pageContainer);
const revisionComparerContainer = new RevisionComparerContainer(appContainer, pageContainer);
const commentContainer = new CommentContainer(appContainer);
const editorContainer = new EditorContainer(appContainer, defaultEditorOptions, defaultPreviewOptions);
const tagContainer = new TagContainer(appContainer);
const personalContainer = new PersonalContainer(appContainer);
const pageAccessoriesContainer = new PageAccessoriesContainer(appContainer);
const injectableContainers = [
  appContainer, socketIoContainer, navigationContainer, pageContainer, pageHistoryContainer, revisionComparerContainer,
  commentContainer, editorContainer, tagContainer, personalContainer, pageAccessoriesContainer,
];

logger.info('unstated containers have been initialized');

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
Object.assign(componentMappings, {
  'grw-sidebar-wrapper': <Sidebar />,

  'search-page': <SearchPage crowi={appContainer} />,

  // 'revision-history': <PageHistory pageId={pageId} />,
  'tags-page': <TagsList crowi={appContainer} />,

  'grw-page-status-alert-container': <PageStatusAlert />,

  'trash-page-alert': <TrashPageAlert />,

  'trash-page-list': <TrashPageList />,

  'not-found-page': <NotFoundPage />,
  'not-found-alert': <NotFoundAlert
    onPageCreateClicked={navigationContainer.setEditorMode}
    isGuestUserMode={appContainer.isGuestUser}
    isHidden={pageContainer.state.isNotCreatable || pageContainer.state.isTrashPage}
  />,

  'forbidden-page': <ForbiddenPage />,

  'page-timeline': <PageTimeline />,

  'personal-setting': <PersonalSettings crowi={personalContainer} />,

  'my-drafts': <MyDraftList />,

  'grw-fab-container': <Fab />,

  'share-link-alert': <ShareLinkAlert />,
  'duplicated-alert': <DuplicatedAlert />,
  'redirected-alert': <RedirectedAlert />,
  'renamed-alert': <RenamedAlert />,
});

// additional definitions if data exists
if (pageContainer.state.pageId != null) {
  Object.assign(componentMappings, {
    'page-comments-list': <PageComments />,
    'page-comment-write': <CommentEditorLazyRenderer />,
    'page-management': <PageManagement />,
    'liker-list': <LikerList />,
    'page-content-footer': <PageContentFooter />,

    'recent-created-icon': <RecentlyCreatedIcon />,
    'user-bookmark-icon': <BookmarkIcon />,
  });

  // show the Page accessory modal when query of "compare" is requested
  if (revisionComparerContainer.getRevisionIDsToCompareAsParam().length > 0) {
    pageAccessoriesContainer.openPageAccessoriesModal('pageHistory');
  }
}
if (pageContainer.state.creator != null) {
  Object.assign(componentMappings, {
    'user-created-list': <RecentCreated userId={pageContainer.state.creator._id} />,
    'user-bookmark-list': <BookmarkList userId={pageContainer.state.creator._id} />,
  });
}
if (pageContainer.state.path != null) {
  Object.assign(componentMappings, {
    // eslint-disable-next-line quote-props
    'page': <Page />,
    'grw-subnav-container': <GrowiSubNavigation />,
    'grw-subnav-switcher-container': <GrowiSubNavigationSwitcher />,
    'display-switcher': <DisplaySwitcher />,
  });
}

Object.keys(componentMappings).forEach((key) => {
  const elem = document.getElementById(key);
  if (elem) {
    ReactDOM.render(
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary>
          <Provider inject={injectableContainers}>
            {componentMappings[key]}
          </Provider>
        </ErrorBoundary>
      </I18nextProvider>,
      elem,
    );
  }
});

// initialize scrollpos-styler
ScrollPosStyler.init();
