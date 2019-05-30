/* eslint-disable max-len */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';
import { I18nextProvider } from 'react-i18next';
import * as toastr from 'toastr';

import loggerFactory from '@alias/logger';
import Xss from '@commons/service/xss';
import * as entities from 'entities';
import i18nFactory from './i18n';


import GrowiRenderer from './util/GrowiRenderer';

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
import CommentContainer from './components/PageComment/CommentContainer';
import EditorContainer from './services/EditorContainer';


const logger = loggerFactory('growi:app');

if (!window) {
  window = {};
}

const userlang = $('body').data('userlang');
const i18n = i18nFactory(userlang);

// setup xss library
const xss = new Xss();
window.xss = xss;

const mainContent = document.querySelector('#content-main');
let pageId = null;
let pageRevisionId = null;
let pageRevisionCreatedAt = null;
let pageRevisionIdHackmdSynced = null;
let hasDraftOnHackmd = false;
let pageIdOnHackmd = null;
let pagePath;
let pageContent = '';
let markdown = '';
let slackChannels;
let pageTags = [];
let templateTagData = '';
if (mainContent !== null) {
  pageId = mainContent.getAttribute('data-page-id') || null;
  pageRevisionId = mainContent.getAttribute('data-page-revision-id');
  pageRevisionCreatedAt = +mainContent.getAttribute('data-page-revision-created');
  pageRevisionIdHackmdSynced = mainContent.getAttribute('data-page-revision-id-hackmd-synced') || null;
  pageIdOnHackmd = mainContent.getAttribute('data-page-id-on-hackmd') || null;
  hasDraftOnHackmd = !!mainContent.getAttribute('data-page-has-draft-on-hackmd');
  pagePath = mainContent.attributes['data-path'].value;
  slackChannels = mainContent.getAttribute('data-slack-channels') || '';
  templateTagData = mainContent.getAttribute('data-template-tags') || '';
  const rawText = document.getElementById('raw-text-original');
  if (rawText) {
    pageContent = rawText.innerHTML;
  }
  markdown = entities.decodeHTML(pageContent);
}
const isLoggedin = document.querySelector('.main-container.nologin') == null;

const appContainer = new AppContainer();

// backward compatibility
const crowi = appContainer;
window.crowi = appContainer;

if (isLoggedin) {
  appContainer.fetchUsers();
}

const socket = appContainer.getWebSocket();
const socketClientId = appContainer.getSocketClientId();

const crowiRenderer = new GrowiRenderer(crowi, null, {
  mode: 'page',
  isAutoSetup: false, // manually setup because plugins may configure it
  renderToc: appContainer.getCrowiForJquery().renderTocContent, // function for rendering Table Of Contents
});
window.crowiRenderer = crowiRenderer;

// create unstated container instance
const pageContainer = new PageContainer();
const commentContainer = new CommentContainer(crowi, pageContainer);
const editorContainer = new EditorContainer(defaultEditorOptions, defaultPreviewOptions);

// FIXME
const isEnabledPlugins = $('body').data('plugin-enabled');
if (isEnabledPlugins) {
  const crowiPlugin = window.crowiPlugin;
  crowiPlugin.installAll(crowi, crowiRenderer);
}

/**
 * receive tags from PageTagForm
 * @param {Array} tagData new tags
 */
const setTagData = function(tagData) {
  pageTags = tagData;
};

/**
 * component store
 */
const componentInstances = {};

/**
 * save success handler when reloading is not needed
 * @param {object} page Page instance
 */
const saveWithShortcutSuccessHandler = function(page) {
  const editorMode = appContainer.getCrowiForJquery().getCurrentEditorMode();

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
    revisionHackmdSynced: page.revisionHackmdSynced,
    revisionId: page.revision._id,
    markdown: page.revision.body,
  };
  pageContainer.setState(newState);

  // PageEditor component
  if (componentInstances.pageEditor != null) {
    if (editorMode !== 'builtin') {
      componentInstances.pageEditor.updateEditorValue(newState.markdown);
    }
  }
  // PageEditorByHackmd component
  if (componentInstances.pageEditorByHackmd != null) {
    // clear state of PageEditorByHackmd
    componentInstances.pageEditorByHackmd.clearRevisionStatus(newState.revisionId);
    // reset
    if (editorMode !== 'hackmd') {
      componentInstances.pageEditorByHackmd.reset();
    }
  }
  // PageStatusAlert component
  const pageStatusAlert = componentInstances.pageStatusAlert;
  // clear state of PageStatusAlert
  if (componentInstances.pageStatusAlert != null) {
    pageStatusAlert.clearRevisionStatus(pageRevisionId, pageRevisionIdHackmdSynced);
  }

  // hidden input
  $('input[name="revision_id"]').val(pageRevisionId);
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
  const editorMode = appContainer.getCrowiForJquery().getCurrentEditorMode();

  let revisionId = pageRevisionId;
  // get options
  const options = pageContainer.getCurrentOptionsToSave();
  options.socketClientId = socketClientId;
  options.pageTags = pageTags;

  if (editorMode === 'hackmd') {
    // set option to sync
    options.isSyncRevisionToHackmd = true;
    // use revisionId of PageEditorByHackmd
    revisionId = componentInstances.pageEditorByHackmd.getRevisionIdHackmdSynced();
  }

  let promise;
  if (pageId == null) {
    promise = appContainer.createPage(pagePath, markdown, options);
  }
  else {
    promise = appContainer.updatePage(pageId, revisionId, markdown, options);
  }

  promise
    .then(saveWithShortcutSuccessHandler)
    .catch(errorHandler);
};

const saveWithSubmitButtonSuccessHandler = function() {
  appContainer.clearDraft(pagePath);
  window.location.href = pagePath;
};

const saveWithSubmitButton = function(submitOpts) {
  const editorMode = appContainer.getCrowiForJquery().getCurrentEditorMode();
  if (editorMode == null) {
    // do nothing
    return;
  }

  let revisionId = pageRevisionId;
  // get options
  const options = pageContainer.getCurrentOptionsToSave();
  options.socketClientId = socketClientId;
  options.pageTags = pageTags;

  // set 'submitOpts.overwriteScopesOfDescendants' to options
  options.overwriteScopesOfDescendants = submitOpts ? !!submitOpts.overwriteScopesOfDescendants : false;

  let promise;
  if (editorMode === 'hackmd') {
    // get markdown
    promise = componentInstances.pageEditorByHackmd.getMarkdown();
    // use revisionId of PageEditorByHackmd
    revisionId = componentInstances.pageEditorByHackmd.getRevisionIdHackmdSynced();
    // set option to sync
    options.isSyncRevisionToHackmd = true;
  }
  else {
    // get markdown
    promise = Promise.resolve(componentInstances.pageEditor.getMarkdown());
  }
  // create or update
  if (pageId == null) {
    promise = promise.then((markdown) => {
      return appContainer.createPage(pagePath, markdown, options);
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

// setup renderer after plugins are installed
crowiRenderer.setup();

// restore draft when the first time to edit
const draft = appContainer.findDraft(pagePath);
if (!pageRevisionId && draft != null) {
  markdown = draft;
}

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
const componentMappings = {
  'search-top': <I18nextProvider i18n={i18n}><HeaderSearchBox crowi={crowi} /></I18nextProvider>,
  'search-sidebar': <I18nextProvider i18n={i18n}><HeaderSearchBox crowi={crowi} /></I18nextProvider>,
  'search-page': <I18nextProvider i18n={i18n}><SearchPage crowi={crowi} crowiRenderer={crowiRenderer} /></I18nextProvider>,

  // 'revision-history': <PageHistory pageId={pageId} />,
  'bookmark-button': <BookmarkButton pageId={pageId} crowi={crowi} />,
  'bookmark-button-lg': <BookmarkButton pageId={pageId} crowi={crowi} size="lg" />,

  'tags-page': <I18nextProvider i18n={i18n}><TagsList crowi={crowi} /></I18nextProvider>,

  'create-page-name-input': <PagePathAutoComplete crowi={crowi} initializedPath={pagePath} addTrailingSlash />,
  'rename-page-name-input': <PagePathAutoComplete crowi={crowi} initializedPath={pagePath} />,
  'duplicate-page-name-input': <PagePathAutoComplete crowi={crowi} initializedPath={pagePath} />,

};

// additional definitions if data exists
let pageComments = null;
if (pageId) {
  componentMappings['page-comments-list'] = (
    <I18nextProvider i18n={i18n}>
      <Provider inject={[commentContainer, editorContainer]}>
        <PageComments
          ref={(elem) => {
            if (pageComments == null) {
              pageComments = elem;
            }
          }}
          revisionCreatedAt={pageRevisionCreatedAt}
          pageId={pageId}
          pagePath={pagePath}
          slackChannels={slackChannels}
          crowi={crowi}
          crowiOriginRenderer={crowiRenderer}
          revisionId={pageRevisionId}
        />
      </Provider>
    </I18nextProvider>
  );
  componentMappings['page-attachment'] = <PageAttachment pageId={pageId} markdown={markdown} crowi={crowi} />;
}
if (pagePath) {
  componentMappings.page = <Page crowiRenderer={crowiRenderer} onSaveWithShortcut={saveWithShortcut} />;
  componentMappings['revision-path'] = <I18nextProvider i18n={i18n}><RevisionPath pageId={pageId} pagePath={pagePath} crowi={crowi} /></I18nextProvider>;
  componentMappings['tag-label'] = <I18nextProvider i18n={i18n}><TagLabels crowi={crowi} pageId={pageId} sendTagData={setTagData} templateTagData={templateTagData} /></I18nextProvider>;
}

Object.keys(componentMappings).forEach((key) => {
  const elem = document.getElementById(key);
  if (elem) {
    componentInstances[key] = ReactDOM.render(
      <Provider inject={[appContainer, pageContainer]}>
        {componentMappings[key]}
      </Provider>,
      elem,
    );
  }
});

// set page if exists
if (componentInstances.page != null) {
  appContainer.setPage(componentInstances.page);
}

// render LikeButton
const likeButtonElem = document.getElementById('like-button');
if (likeButtonElem) {
  const isLiked = likeButtonElem.dataset.liked === 'true';
  ReactDOM.render(
    <LikeButton crowi={crowi} pageId={pageId} isLiked={isLiked} />,
    likeButtonElem,
  );
}

// render UserPictureList for seen-user-list
const seenUserListElem = document.getElementById('seen-user-list');
if (seenUserListElem) {
  const userIdsStr = seenUserListElem.dataset.userIds;
  const userIds = userIdsStr.split(',');
  ReactDOM.render(
    <UserPictureList crowi={crowi} userIds={userIds} />,
    seenUserListElem,
  );
}
// render UserPictureList for liker-list
const likerListElem = document.getElementById('liker-list');
if (likerListElem) {
  const userIdsStr = likerListElem.dataset.userIds;
  const userIds = userIdsStr.split(',');
  ReactDOM.render(
    <UserPictureList crowi={crowi} userIds={userIds} />,
    likerListElem,
  );
}

// render SavePageControls
let savePageControls = null;
const savePageControlsElem = document.getElementById('save-page-controls');
if (savePageControlsElem) {
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <Provider inject={[appContainer, pageContainer]}>
        <SavePageControls
          onSubmit={saveWithSubmitButton}
          ref={(elem) => {
              if (savePageControls == null) {
                savePageControls = elem;
              }
            }}
        />
      </Provider>
    </I18nextProvider>,
    savePageControlsElem,
  );
  componentInstances.savePageControls = savePageControls;
}

const recentCreatedControlsElem = document.getElementById('user-created-list');
if (recentCreatedControlsElem) {
  let limit = appContainer.getConfig().recentCreatedLimit;
  if (limit == null) {
    limit = 10;
  }
  ReactDOM.render(
    <RecentCreated crowi={crowi} pageId={pageId} limit={limit}>

    </RecentCreated>, document.getElementById('user-created-list'),
  );
}

const myDraftControlsElem = document.getElementById('user-draft-list');
if (myDraftControlsElem) {
  let limit = appContainer.getConfig().recentCreatedLimit;
  if (limit == null) {
    limit = 10;
  }

  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <MyDraftList
        limit={limit}
        crowi={crowi}
        crowiOriginRenderer={crowiRenderer}
      />
    </I18nextProvider>,
    myDraftControlsElem,
  );
}

/*
 * HackMD Editor
 */
// render PageEditorWithHackmd
let pageEditorByHackmd = null;
const pageEditorWithHackmdElem = document.getElementById('page-editor-with-hackmd');
if (pageEditorWithHackmdElem) {
  pageEditorByHackmd = ReactDOM.render(
    <PageEditorByHackmd
      crowi={crowi}
      pageId={pageId}
      revisionId={pageRevisionId}
      pageIdOnHackmd={pageIdOnHackmd}
      revisionIdHackmdSynced={pageRevisionIdHackmdSynced}
      hasDraftOnHackmd={hasDraftOnHackmd}
      markdown={markdown}
      onSaveWithShortcut={saveWithShortcut}
    />,
    pageEditorWithHackmdElem,
  );
  componentInstances.pageEditorByHackmd = pageEditorByHackmd;
}


/*
 * PageEditor
 */
let pageEditor = null;
// render PageEditor
const pageEditorElem = document.getElementById('page-editor');
if (pageEditorElem) {
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <Provider inject={[appContainer, pageContainer, editorContainer]}>
        <PageEditor
          ref={(elem) => {
            if (pageEditor == null) {
              pageEditor = elem;
            }
          }}
          crowiRenderer={crowiRenderer}
          onSaveWithShortcut={saveWithShortcut}
        />
      </Provider>
    </I18nextProvider>,
    pageEditorElem,
  );
  componentInstances.pageEditor = pageEditor;
  // set refs for setCaretLine/forceToFocus when tab is changed
  appContainer.setPageEditor(pageEditor);
}

// render comment form
const writeCommentElem = document.getElementById('page-comment-write');
if (writeCommentElem) {
  ReactDOM.render(
    <Provider inject={[commentContainer, editorContainer]}>
      <I18nextProvider i18n={i18n}>
        <CommentEditorLazyRenderer
          crowi={crowi}
          crowiOriginRenderer={crowiRenderer}
          slackChannels={slackChannels}
        >
        </CommentEditorLazyRenderer>
      </I18nextProvider>
    </Provider>,
    writeCommentElem,
  );
}

// render OptionsSelector
const pageEditorOptionsSelectorElem = document.getElementById('page-editor-options-selector');
if (pageEditorOptionsSelectorElem) {
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <Provider inject={[editorContainer]}>
        <OptionsSelector crowi={crowi} />
      </Provider>
    </I18nextProvider>,
    pageEditorOptionsSelectorElem,
  );
}

// render PageStatusAlert
let pageStatusAlert = null;
const pageStatusAlertElem = document.getElementById('page-status-alert');
if (pageStatusAlertElem) {
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <PageStatusAlert
        ref={(elem) => {
            if (pageStatusAlert == null) {
              pageStatusAlert = elem;
            }
          }}
        revisionId={pageRevisionId}
        revisionIdHackmdSynced={pageRevisionIdHackmdSynced}
        hasDraftOnHackmd={hasDraftOnHackmd}
      />
    </I18nextProvider>,
    pageStatusAlertElem,
  );
  componentInstances.pageStatusAlert = pageStatusAlert;
}

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

// notification from websocket
function updatePageStatusAlert(page, user) {
  const pageStatusAlert = componentInstances.pageStatusAlert;
  if (pageStatusAlert != null) {
    const revisionId = page.revision._id;
    const revisionIdHackmdSynced = page.revisionHackmdSynced;
    pageStatusAlert.setRevisionId(revisionId, revisionIdHackmdSynced);
    pageStatusAlert.setLastUpdateUsername(user.name);
  }
}
socket.on('page:create', (data) => {
  // skip if triggered myself
  if (data.socketClientId != null && data.socketClientId === socketClientId) {
    return;
  }

  logger.debug({ obj: data }, `websocket on 'page:create'`); // eslint-disable-line quotes

  // update PageStatusAlert
  if (data.page.path === pagePath) {
    updatePageStatusAlert(data.page, data.user);
  }
});
socket.on('page:update', (data) => {
  // skip if triggered myself
  if (data.socketClientId != null && data.socketClientId === socketClientId) {
    return;
  }

  logger.debug({ obj: data }, `websocket on 'page:update'`); // eslint-disable-line quotes

  if (data.page.path === pagePath) {
    // update PageStatusAlert
    updatePageStatusAlert(data.page, data.user);
    // update PageEditorByHackmd
    const pageEditorByHackmd = componentInstances.pageEditorByHackmd;
    if (pageEditorByHackmd != null) {
      const page = data.page;
      pageEditorByHackmd.setRevisionId(page.revision._id, page.revisionHackmdSynced);
      pageEditorByHackmd.setHasDraftOnHackmd(data.page.hasDraftOnHackmd);
    }
  }
});
socket.on('page:delete', (data) => {
  // skip if triggered myself
  if (data.socketClientId != null && data.socketClientId === socketClientId) {
    return;
  }

  logger.debug({ obj: data }, `websocket on 'page:delete'`); // eslint-disable-line quotes

  // update PageStatusAlert
  if (data.page.path === pagePath) {
    updatePageStatusAlert(data.page, data.user);
  }
});
socket.on('page:editingWithHackmd', (data) => {
  // skip if triggered myself
  if (data.socketClientId != null && data.socketClientId === socketClientId) {
    return;
  }

  logger.debug({ obj: data }, `websocket on 'page:editingWithHackmd'`); // eslint-disable-line quotes

  if (data.page.path === pagePath) {
    // update PageStatusAlert
    const pageStatusAlert = componentInstances.pageStatusAlert;
    if (pageStatusAlert != null) {
      pageStatusAlert.setHasDraftOnHackmd(data.page.hasDraftOnHackmd);
    }
    // update PageEditorByHackmd
    const pageEditorByHackmd = componentInstances.pageEditorByHackmd;
    if (pageEditorByHackmd != null) {
      pageEditorByHackmd.setHasDraftOnHackmd(data.page.hasDraftOnHackmd);
    }
  }
});

// うわーもうー (commented by Crowi team -- 2018.03.23 Yuki Takei)
$('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', () => {
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <PageHistory pageId={pageId} crowi={crowi} />
    </I18nextProvider>, document.getElementById('revision-history'),
  );
});
