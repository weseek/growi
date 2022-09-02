import React from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { SWRConfig } from 'swr';
import { Provider } from 'unstated';

import ContextExtractor from '~/client/services/ContextExtractor';
import EditorContainer from '~/client/services/EditorContainer';
import PageContainer from '~/client/services/PageContainer';
import { IdenticalPathPage } from '~/components/IdenticalPathPage';
import PrivateLegacyPages from '~/components/PrivateLegacyPages';
import loggerFactory from '~/utils/logger';
import { swrGlobalConfiguration } from '~/utils/swr-utils';

import ErrorBoundary from '../components/ErrorBoudary';
import Fab from '../components/Fab';
import ForbiddenPage from '../components/ForbiddenPage';
import RecentlyCreatedIcon from '../components/Icons/RecentlyCreatedIcon';
import InAppNotificationPage from '../components/InAppNotification/InAppNotificationPage';
import PersonalSettings from '../components/Me/PersonalSettings';
import MyDraftList from '../components/MyDraftList/MyDraftList';
import GrowiContextualSubNavigation from '../components/Navbar/GrowiContextualSubNavigation';
import GrowiSubNavigationSwitcher from '../components/Navbar/GrowiSubNavigationSwitcher';
import NotFoundPage from '../components/NotFoundPage';
import { Page } from '../components/Page';
import DisplaySwitcher from '../components/Page/DisplaySwitcher';
import RedirectedAlert from '../components/Page/RedirectedAlert';
import ShareLinkAlert from '../components/Page/ShareLinkAlert';
import { PageComment } from '../components/PageComment';
import CommentEditorLazyRenderer from '../components/PageComment/CommentEditorLazyRenderer';
import PageContentFooter from '../components/PageContentFooter';
import BookmarkList from '../components/PageList/BookmarkList';
import PageStatusAlert from '../components/PageStatusAlert';
import { PageTimeline } from '../components/PageTimeline';
import RecentCreated from '../components/RecentCreated/RecentCreated';
import { SearchPage } from '../components/SearchPage';
import Sidebar from '../components/Sidebar';
import TrashPageList from '../components/TrashPageList';

import { appContainer, componentMappings } from './base';

const logger = loggerFactory('growi:cli:app');

appContainer.initContents();

const { i18n } = appContainer;
const socketIoContainer = appContainer.getContainer('SocketIoContainer');

// create unstated container instance
const pageContainer = new PageContainer(appContainer);
const editorContainer = new EditorContainer(appContainer);
const injectableContainers = [
  appContainer, socketIoContainer, pageContainer, editorContainer,
];

logger.info('unstated containers have been initialized');

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
Object.assign(componentMappings, {
  'grw-sidebar-wrapper': <Sidebar />,

  'search-page': <SearchPage appContainer={appContainer} />,
  'private-regacy-pages': <PrivateLegacyPages appContainer={appContainer} />,

  'all-in-app-notifications': <InAppNotificationPage />,
  'identical-path-page': <IdenticalPathPage />,

  // 'revision-history': <PageHistory pageId={pageId} />,

  'grw-page-status-alert-container': <PageStatusAlert />,

  'maintenance-mode-content': <MaintenanceModeContent />,

  'trash-page-list-container': <TrashPageList />,

  'not-found-page': <NotFoundPage />,

  'forbidden-page': <ForbiddenPage isLinkSharingDisabled={appContainer.config.disableLinkSharing} />,

  'page-timeline': <PageTimeline />,

  'personal-setting': <PersonalSettings />,
  'my-drafts': <MyDraftList />,

  'grw-fab-container': <Fab />,

  'share-link-alert': <ShareLinkAlert />,
  'redirected-alert': <RedirectedAlert />,
});

// additional definitions if data exists
if (pageContainer.state.pageId != null) {
  Object.assign(componentMappings, {
    'page-comments-list': <PageComment appContainer={appContainer} pageId={pageContainer.state.pageId} isReadOnly={false} titleAlign="left" />,
    'page-comment-write': <CommentEditorLazyRenderer appContainer={appContainer} pageId={pageContainer.state.pageId} />,
    'page-content-footer': <PageContentFooter
      createdAt={new Date(pageContainer.state.createdAt)}
      updatedAt={new Date(pageContainer.state.updatedAt)}
      creator={pageContainer.state.creator}
      revisionAuthor={pageContainer.state.revisionAuthor}
    />,

    'recent-created-icon': <RecentlyCreatedIcon />,
  });
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
    'grw-subnav-container': <GrowiContextualSubNavigation isLinkSharingDisabled={appContainer.config.disableLinkSharing} />,
    'grw-subnav-switcher-container': <GrowiSubNavigationSwitcher isLinkSharingDisabled={appContainer.config.disableLinkSharing} />,
    'display-switcher': <DisplaySwitcher />,
  });
}

const renderMainComponents = () => {
  Object.keys(componentMappings).forEach((key) => {
    const elem = document.getElementById(key);
    if (elem) {
      ReactDOM.render(
        <I18nextProvider i18n={i18n}>
          <ErrorBoundary>
            <SWRConfig value={swrGlobalConfiguration}>
              <Provider inject={injectableContainers}>
                <DndProvider backend={HTML5Backend}>
                  {componentMappings[key]}
                </DndProvider>
              </Provider>
            </SWRConfig>
          </ErrorBoundary>
        </I18nextProvider>,
        elem,
      );
    }
  });
};

// extract context before rendering main components
const elem = document.getElementById('growi-context-extractor');
if (elem != null) {
  ReactDOM.render(
    <SWRConfig value={swrGlobalConfiguration}>
      <ContextExtractor></ContextExtractor>
    </SWRConfig>,
    elem,
    renderMainComponents,
  );
}
else {
  renderMainComponents();
}

// initialize scrollpos-styler
ScrollPosStyler.init();
