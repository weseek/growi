import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';
import { I18nextProvider } from 'react-i18next';

import loggerFactory from '@alias/logger';

import ErrorBoundary from './components/ErrorBoudary';
import SearchPage from './components/SearchPage';
import TagsList from './components/TagsList';
import PageEditor from './components/PageEditor';
import PagePathNavForEditor from './components/PageEditor/PagePathNavForEditor';
// eslint-disable-next-line import/no-duplicates
import OptionsSelector from './components/PageEditor/OptionsSelector';
// eslint-disable-next-line import/no-duplicates
import { defaultEditorOptions, defaultPreviewOptions } from './components/PageEditor/OptionsSelector';
import SavePageControls from './components/SavePageControls';
import PageEditorByHackmd from './components/PageEditorByHackmd';
import Page from './components/Page';
import PageHistory from './components/PageHistory';
import PageComments from './components/PageComments';
import PageTimeline from './components/PageTimeline';
import CommentEditorLazyRenderer from './components/PageComment/CommentEditorLazyRenderer';
import PageManagement from './components/Page/PageManagement';
import PageShareManagement from './components/Page/PageShareManagement';
import TrashPageAlert from './components/Page/TrashPageAlert';
import PageAttachment from './components/PageAttachment';
import PageStatusAlert from './components/PageStatusAlert';
import RecentCreated from './components/RecentCreated/RecentCreated';
import MyDraftList from './components/MyDraftList/MyDraftList';
import SeenUserList from './components/User/SeenUserList';
import LikerList from './components/User/LikerList';
import TableOfContents from './components/TableOfContents';

import PersonalSettings from './components/Me/PersonalSettings';
import NavigationContainer from './services/NavigationContainer';
import PageContainer from './services/PageContainer';
import CommentContainer from './services/CommentContainer';
import EditorContainer from './services/EditorContainer';
import TagContainer from './services/TagContainer';
import GrowiSubNavigation from './components/Navbar/GrowiSubNavigation';
import GrowiSubNavigationForUserPage from './components/Navbar/GrowiSubNavigationForUserPage';
import PersonalContainer from './services/PersonalContainer';

import { appContainer, componentMappings } from './base';

const logger = loggerFactory('growi:cli:app');

appContainer.initContents();

const { i18n } = appContainer;
const websocketContainer = appContainer.getContainer('WebsocketContainer');

// create unstated container instance
const navigationContainer = new NavigationContainer(appContainer);
const pageContainer = new PageContainer(appContainer);
const commentContainer = new CommentContainer(appContainer);
const editorContainer = new EditorContainer(appContainer, defaultEditorOptions, defaultPreviewOptions);
const tagContainer = new TagContainer(appContainer);
const personalContainer = new PersonalContainer(appContainer);
const injectableContainers = [
  appContainer, websocketContainer, navigationContainer, pageContainer, commentContainer, editorContainer, tagContainer, personalContainer,
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

  'page-status-alert': <PageStatusAlert />,

  'trash-page-alert': <TrashPageAlert />,

  'page-timeline': <PageTimeline />,

  'personal-setting': <PersonalSettings crowi={personalContainer} />,
});

// additional definitions if data exists
if (pageContainer.state.pageId != null) {
  Object.assign(componentMappings, {
    'page-comments-list': <PageComments />,
    'page-comment-write': <CommentEditorLazyRenderer />,
    'page-attachment': <PageAttachment />,
    'page-management': <PageManagement />,
    'page-share-management': <PageShareManagement />,

    'revision-toc': <TableOfContents />,
    'seen-user-list': <SeenUserList />,
    'liker-list': <LikerList />,

    'user-created-list': <RecentCreated />,
    'user-draft-list': <MyDraftList />,
  });
}
if (pageContainer.state.path != null) {
  Object.assign(componentMappings, {
    // eslint-disable-next-line quote-props
    'page': <Page />,
    'grw-subnav': <GrowiSubNavigation />,
    'grw-subnav-for-user-page': <GrowiSubNavigationForUserPage />,
  });
}
// additional definitions if user is logged in
if (appContainer.currentUser != null) {
  Object.assign(componentMappings, {
    'page-editor': <PageEditor />,
    'page-editor-path-nav': <PagePathNavForEditor />,
    'page-editor-options-selector': <OptionsSelector crowi={appContainer} />,
    'save-page-controls': <SavePageControls />,
  });
  if (pageContainer.state.pageId != null) {
    Object.assign(componentMappings, {
      'page-editor-with-hackmd': <PageEditorByHackmd />,
    });
  }
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

// うわーもうー (commented by Crowi team -- 2018.03.23 Yuki Takei)
$('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', () => {
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <PageHistory pageId={pageContainer.state.pageId} crowi={appContainer} />
      </ErrorBoundary>
    </I18nextProvider>, document.getElementById('revision-history'),
  );
});

// initialize scrollpos-styler
ScrollPosStyler.init();
