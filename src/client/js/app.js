/* eslint-disable max-len */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';
import { I18nextProvider } from 'react-i18next';
import * as toastr from 'toastr';

import loggerFactory from '@alias/logger';
import Xss from '@commons/service/xss';
import i18nFactory from './i18n';

import HeaderSearchBox from './components/HeaderSearchBox';
import SearchPage from './components/SearchPage';
import TagsList from './components/TagsList';
import PageEditor from './components/PageEditor';
// eslint-disable-next-line import/no-duplicates
import OptionsSelector from './components/PageEditor/OptionsSelector';
// eslint-disable-next-line import/no-duplicates
import { defaultEditorOptions, defaultPreviewOptions } from './components/PageEditor/OptionsSelector';
import SavePageControls from './components/SavePageControls';
import PageEditorByHackmd from './components/PageEditorByHackmd';
import Page from './components/Page';
import PageHistory from './components/PageHistory';
import PageComments from './components/PageComments';
import CommentEditorLazyRenderer from './components/PageComment/CommentEditorLazyRenderer';
import PageAttachment from './components/PageAttachment';
import PageStatusAlert from './components/PageStatusAlert';
import RevisionPath from './components/Page/RevisionPath';
import TagLabels from './components/Page/TagLabels';
import BookmarkButton from './components/BookmarkButton';
import LikeButton from './components/LikeButton';
import PagePathAutoComplete from './components/PagePathAutoComplete';
import RecentCreated from './components/RecentCreated/RecentCreated';
import MyDraftList from './components/MyDraftList/MyDraftList';
import UserPictureList from './components/User/UserPictureList';

import CustomCssEditor from './components/Admin/CustomCssEditor';
import CustomScriptEditor from './components/Admin/CustomScriptEditor';
import CustomHeaderEditor from './components/Admin/CustomHeaderEditor';
import AdminRebuildSearch from './components/Admin/AdminRebuildSearch';
import GroupDeleteModal from './components/GroupDeleteModal/GroupDeleteModal';

import AppContainer from './services/AppContainer';
import PageContainer from './services/PageContainer';
import CommentContainer from './services/CommentContainer';
import EditorContainer from './services/EditorContainer';
import TagContainer from './services/TagContainer';
import WebsocketContainer from './services/WebsocketContainer';

const logger = loggerFactory('growi:app');

if (!window) {
  window = {};
}

const userlang = $('body').data('userlang');
const i18n = i18nFactory(userlang);

// setup xss library
const xss = new Xss();
window.xss = xss;

const isLoggedin = document.querySelector('.main-container.nologin') == null;

// create unstated container instance
const appContainer = new AppContainer();
const websocketContainer = new WebsocketContainer(appContainer);
const pageContainer = new PageContainer(appContainer);
const commentContainer = new CommentContainer(appContainer);
const editorContainer = new EditorContainer(appContainer, defaultEditorOptions, defaultPreviewOptions);
const tagContainer = new TagContainer(appContainer);
const injectableContainers = [
  appContainer, websocketContainer, pageContainer, commentContainer, editorContainer, tagContainer,
];
window.appContainer = appContainer;

logger.info('unstated containers have been initialized');

if (isLoggedin) {
  appContainer.fetchUsers();
}

const originRenderer = appContainer.getOriginRenderer();
window.growiRenderer = originRenderer;

// backward compatibility
const crowi = appContainer;
window.crowi = appContainer;
window.crowiRenderer = originRenderer;

// FIXME
const isEnabledPlugins = $('body').data('plugin-enabled');
if (isEnabledPlugins) {
  const crowiPlugin = window.crowiPlugin;
  crowiPlugin.installAll(appContainer, originRenderer);
}

/**
 * save success handler when reloading is not needed
 * @param {object} page Page instance
 */
const saveWithShortcutSuccessHandler = function(result) {
  const { page, tags } = result;
  const { editorMode } = appContainer.state;

  // show toastr
  toastr.success(undefined, 'Saved successfully', {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '1200',
    extendedTimeOut: '150',
  });

  // update state of PageContainer
  const newState = {
    pageId: page._id,
    revisionId: page.revision._id,
    revisionCreatedAt: new Date(page.revision.createdAt).getTime() / 1000,
    remoteRevisionId: page.revision._id,
    revisionIdHackmdSynced: page.revisionHackmdSynced,
    hasDraftOnHackmd: page.hasDraftOnHackmd,
    markdown: page.revision.body,
    tags,
  };
  pageContainer.setState(newState);

  // update state of EditorContainer
  editorContainer.setState({ tags });

  // PageEditor component
  const pageEditor = appContainer.getComponentInstance('PageEditor');
  if (pageEditor != null) {
    if (editorMode !== 'builtin') {
      pageEditor.updateEditorValue(newState.markdown);
    }
  }
  // PageEditorByHackmd component
  const pageEditorByHackmd = appContainer.getComponentInstance('PageEditorByHackmd');
  if (pageEditorByHackmd != null) {
    // reset
    if (editorMode !== 'hackmd') {
      pageEditorByHackmd.reset();
    }
  }

  // hidden input
  $('input[name="revision_id"]').val(newState.revisionId);
};

const errorHandler = function(error) {
  toastr.error(error.message, 'Error occured', {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '3000',
  });
};

const saveWithShortcut = function(markdown) {
  const { editorMode } = appContainer.state;

  const { pageId, path } = pageContainer.state;
  let { revisionId } = pageContainer.state;

  // get options
  const options = editorContainer.getCurrentOptionsToSave();
  options.socketClientId = websocketContainer.getCocketClientId();
  options.pageTags = editorContainer.state.tags;

  if (editorMode === 'hackmd') {
    // set option to sync
    options.isSyncRevisionToHackmd = true;
    revisionId = pageContainer.state.revisionIdHackmdSynced;
  }

  let promise;
  if (pageId == null) {
    promise = appContainer.createPage(path, markdown, options);
  }
  else {
    promise = appContainer.updatePage(pageId, revisionId, markdown, options);
  }

  promise
    .then(saveWithShortcutSuccessHandler)
    .catch(errorHandler);
};

const saveWithSubmitButtonSuccessHandler = function() {
  const { path } = pageContainer.state;
  pageContainer.clearDraft(path);
  window.location.href = path;
};

const saveWithSubmitButton = function(submitOpts) {
  const { editorMode } = appContainer.state;
  if (editorMode == null) {
    // do nothing
    return;
  }

  const { pageId, path } = pageContainer.state;
  let { revisionId } = pageContainer.state;
  // get options
  const options = editorContainer.getCurrentOptionsToSave();
  options.socketClientId = websocketContainer.getCocketClientId();
  options.pageTags = editorContainer.state.tags;

  // set 'submitOpts.overwriteScopesOfDescendants' to options
  options.overwriteScopesOfDescendants = submitOpts ? !!submitOpts.overwriteScopesOfDescendants : false;

  let promise;
  if (editorMode === 'hackmd') {
    const pageEditorByHackmd = appContainer.getComponentInstance('PageEditorByHackmd');
    // get markdown
    promise = pageEditorByHackmd.getMarkdown();
    // use revisionId of PageEditorByHackmd
    revisionId = pageContainer.state.revisionIdHackmdSynced;
    // set option to sync
    options.isSyncRevisionToHackmd = true;
  }
  else {
    const pageEditor = appContainer.getComponentInstance('PageEditor');
    // get markdown
    promise = Promise.resolve(pageEditor.getMarkdown());
  }
  // create or update
  if (pageId == null) {
    promise = promise.then((markdown) => {
      return appContainer.createPage(path, markdown, options);
    });
  }
  else {
    promise = promise.then((markdown) => {
      return appContainer.updatePage(pageId, revisionId, markdown, options);
    });
  }

  promise
    .then(saveWithSubmitButtonSuccessHandler)
    .catch(errorHandler);
};

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
let componentMappings = {
  'search-top': <HeaderSearchBox crowi={crowi} />,
  'search-sidebar': <HeaderSearchBox crowi={crowi} />,
  'search-page': <SearchPage crowi={crowi} />,

  // 'revision-history': <PageHistory pageId={pageId} />,
  'tags-page': <TagsList crowi={crowi} />,

  'create-page-name-input': <PagePathAutoComplete crowi={crowi} initializedPath={pageContainer.state.path} addTrailingSlash />,

  'page-editor': <PageEditor onSaveWithShortcut={saveWithShortcut} />,
  'page-editor-options-selector': <OptionsSelector crowi={crowi} />,
  'page-status-alert': <PageStatusAlert />,
  'save-page-controls': <SavePageControls onSubmit={saveWithSubmitButton} />,

  'user-created-list': <RecentCreated />,
  'user-draft-list': <MyDraftList />,
};

// additional definitions if data exists
if (pageContainer.state.pageId != null) {
  componentMappings = Object.assign({
    'page-editor-with-hackmd': <PageEditorByHackmd onSaveWithShortcut={saveWithShortcut} />,
    'page-comments-list': <PageComments />,
    'page-attachment':  <PageAttachment />,
    'page-comment-write':  <CommentEditorLazyRenderer />,
    'like-button': <LikeButton pageId={pageContainer.state.pageId} isLiked={pageContainer.state.isLiked} />,
    'seen-user-list': <UserPictureList userIds={pageContainer.state.seenUserIds} />,
    'liker-list': <UserPictureList userIds={pageContainer.state.likerUserIds} />,
    'bookmark-button':  <BookmarkButton pageId={pageContainer.state.pageId} crowi={crowi} />,
    'bookmark-button-lg':  <BookmarkButton pageId={pageContainer.state.pageId} crowi={crowi} size="lg" />,
    'rename-page-name-input':  <PagePathAutoComplete crowi={crowi} initializedPath={pageContainer.state.path} />,
    'duplicate-page-name-input':  <PagePathAutoComplete crowi={crowi} initializedPath={pageContainer.state.path} />,
  }, componentMappings);
}
if (pageContainer.state.path != null) {
  componentMappings = Object.assign({
    // eslint-disable-next-line quote-props
    'page': <Page onSaveWithShortcut={saveWithShortcut} />,
    'revision-path':  <RevisionPath pageId={pageContainer.state.pageId} pagePath={pageContainer.state.path} crowi={crowi} />,
    'tag-label':  <TagLabels />,
  }, componentMappings);
}

Object.keys(componentMappings).forEach((key) => {
  const elem = document.getElementById(key);
  if (elem) {
    ReactDOM.render(
      <I18nextProvider i18n={i18n}>
        <Provider inject={injectableContainers}>
          {componentMappings[key]}
        </Provider>
      </I18nextProvider>,
      elem,
    );
  }
});

// render for admin
const customCssEditorElem = document.getElementById('custom-css-editor');
if (customCssEditorElem != null) {
  // get input[type=hidden] element
  const customCssInputElem = document.getElementById('inputCustomCss');

  ReactDOM.render(
    <CustomCssEditor inputElem={customCssInputElem} />,
    customCssEditorElem,
  );
}
const customScriptEditorElem = document.getElementById('custom-script-editor');
if (customScriptEditorElem != null) {
  // get input[type=hidden] element
  const customScriptInputElem = document.getElementById('inputCustomScript');

  ReactDOM.render(
    <CustomScriptEditor inputElem={customScriptInputElem} />,
    customScriptEditorElem,
  );
}
const customHeaderEditorElem = document.getElementById('custom-header-editor');
if (customHeaderEditorElem != null) {
  // get input[type=hidden] element
  const customHeaderInputElem = document.getElementById('inputCustomHeader');

  ReactDOM.render(
    <CustomHeaderEditor inputElem={customHeaderInputElem} />,
    customHeaderEditorElem,
  );
}
const adminRebuildSearchElem = document.getElementById('admin-rebuild-search');
if (adminRebuildSearchElem != null) {
  ReactDOM.render(
    <AdminRebuildSearch crowi={crowi} />,
    adminRebuildSearchElem,
  );
}
const adminGrantSelectorElem = document.getElementById('admin-delete-user-group-modal');
if (adminGrantSelectorElem != null) {
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <GroupDeleteModal
        crowi={crowi}
      />
    </I18nextProvider>,
    adminGrantSelectorElem,
  );
}

// うわーもうー (commented by Crowi team -- 2018.03.23 Yuki Takei)
$('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', () => {
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <PageHistory pageId={pageContainer.state.pageId} crowi={crowi} />
    </I18nextProvider>, document.getElementById('revision-history'),
  );
});
