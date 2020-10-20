import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';
import { I18nextProvider } from 'react-i18next';

import loggerFactory from '@alias/logger';

import ErrorBoundary from './components/ErrorBoudary';
import SearchPage from './components/SearchPage';
import TagsList from './components/TagsList';
import DisplaySwitcher from './components/Page/DisplaySwitcher';
import { defaultEditorOptions, defaultPreviewOptions } from './components/PageEditor/OptionsSelector';
import Page from './components/Page';
import PageComments from './components/PageComments';
import PageTimeline from './components/PageTimeline';
import CommentEditorLazyRenderer from './components/PageComment/CommentEditorLazyRenderer';
import PageManagement from './components/Page/PageManagement';
import TrashPageList from './components/TrashPageList';
import TrashPageAlert from './components/Page/TrashPageAlert';
import NotFoundPage from './components/NotFoundPage';
import NotFoundAlert from './components/Page/NotFoundAlert';
import PageStatusAlert from './components/PageStatusAlert';
import RecentCreated from './components/RecentCreated/RecentCreated';
import MyBookmarkList from './components/MyBookmarkList/MyBookmarkList';
import SeenUserList from './components/User/SeenUserList';
import LikerList from './components/User/LikerList';
import TableOfContents from './components/TableOfContents';
import Fab from './components/Fab';

import PersonalSettings from './components/Me/PersonalSettings';
import NavigationContainer from './services/NavigationContainer';
import PageContainer from './services/PageContainer';
import PageHistoryContainer from './services/PageHistoryContainer';
import CommentContainer from './services/CommentContainer';
import EditorContainer from './services/EditorContainer';
import TagContainer from './services/TagContainer';
import GrowiSubNavigation from './components/Navbar/GrowiSubNavigation';
import GrowiSubNavigationSwitcher from './components/Navbar/GrowiSubNavigationSwitcher';
import PersonalContainer from './services/PersonalContainer';

import { appContainer, componentMappings } from './base';

const logger = loggerFactory('growi:cli:app');

appContainer.initContents();

const { i18n } = appContainer;
const socketIoContainer = appContainer.getContainer('SocketIoContainer');

// create unstated container instance
const navigationContainer = new NavigationContainer(appContainer);
const pageContainer = new PageContainer(appContainer);
const pageHistoryContainer = new PageHistoryContainer(appContainer, pageContainer);
const commentContainer = new CommentContainer(appContainer);
const editorContainer = new EditorContainer(appContainer, defaultEditorOptions, defaultPreviewOptions);
const tagContainer = new TagContainer(appContainer);
const personalContainer = new PersonalContainer(appContainer);
const injectableContainers = [
  appContainer, socketIoContainer, navigationContainer, pageContainer, pageHistoryContainer, commentContainer, editorContainer, tagContainer, personalContainer,
];

logger.info('unstated containers have been initialized');

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
Object.assign(componentMappings, {
  'search-page': <SearchPage crowi={appContainer} />,

  // 'revision-history': <PageHistory pageId={pageId} />,
  'tags-page': <TagsList crowi={appContainer} />,

  'grw-page-status-alert-container': <PageStatusAlert />,

  'trash-page-alert': <TrashPageAlert />,

  'trash-page-list': <TrashPageList />,

  'not-found-page': <NotFoundPage />,

  'not-found-alert': <NotFoundAlert onPageCreateClicked={navigationContainer.setEditorMode} />,

  'page-timeline': <PageTimeline />,

  'personal-setting': <PersonalSettings crowi={personalContainer} />,

  'grw-fab-container': <Fab />,
});

// additional definitions if data exists
if (pageContainer.state.pageId != null) {
  Object.assign(componentMappings, {
    'page-comments-list': <PageComments />,
    'page-comment-write': <CommentEditorLazyRenderer />,
    'page-management': <PageManagement />,
    'revision-toc': <TableOfContents />,
    'seen-user-list': <SeenUserList />,
    'liker-list': <LikerList />,

    'user-bookmark-list': <MyBookmarkList />,
    'user-created-list': <RecentCreated />,
    // 'user-draft-list': <MyDraftList />,
  });
}
if (pageContainer.state.creator != null) {
  Object.assign(componentMappings, {
    'user-created-list': <RecentCreated userId={pageContainer.state.creator._id} />,
  });
}
if (pageContainer.state.path != null) {
  Object.assign(componentMappings, {
    // eslint-disable-next-line quote-props
    'page': <Page />,
    'grw-subnav-container': <GrowiSubNavigation />,
    'grw-subnav-switcher-container': <GrowiSubNavigationSwitcher />,
  });
}
// additional definitions if user is logged in
if (appContainer.currentUser != null) {
  Object.assign(componentMappings, {
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
