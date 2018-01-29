import React from 'react';
import ReactDOM from 'react-dom';

import Crowi from './util/Crowi';
import CrowiRenderer from './util/CrowiRenderer';

import HeaderSearchBox  from './components/HeaderSearchBox';
import SearchPage       from './components/SearchPage';
import PageEditor       from './components/PageEditor';
import ThemeSelector    from './components/PageEditor/ThemeSelector';
import PageListSearch   from './components/PageListSearch';
import PageHistory      from './components/PageHistory';
import PageComments     from './components/PageComments';
import PageCommentFormBehavior from './components/PageCommentFormBehavior';
import PageAttachment   from './components/PageAttachment';
import SeenUserList     from './components/SeenUserList';
import RevisionPath     from './components/Page/RevisionPath';
import RevisionUrl      from './components/Page/RevisionUrl';
import BookmarkButton   from './components/BookmarkButton';
import NewPageNameInputter from './components/NewPageNameInputter';
import SearchTypeahead  from './components/SearchTypeahead';

import CustomCssEditor  from './components/Admin/CustomCssEditor';
import CustomScriptEditor from './components/Admin/CustomScriptEditor';

import * as entities from 'entities';


if (!window) {
  window = {};
}

const mainContent = document.querySelector('#content-main');
let pageId = null;
let pageRevisionId = null;
let pageRevisionCreatedAt = null;
let pagePath;
let pageContent = '';
if (mainContent !== null) {
  pageId = mainContent.getAttribute('data-page-id');
  pageRevisionId = mainContent.getAttribute('data-page-revision-id');
  pageRevisionCreatedAt = +mainContent.getAttribute('data-page-revision-created');
  pagePath = mainContent.attributes['data-path'].value;
  const rawText = document.getElementById('raw-text-original');
  if (rawText) {
    pageContent = rawText.innerHTML;
  }
}
const isLoggedin = document.querySelector('.main-container.nologin') == null;

// FIXME
const crowi = new Crowi({
  me: $('body').data('current-username'),
  csrfToken: $('body').data('csrftoken'),
}, window);
window.crowi = crowi;
crowi.setConfig(JSON.parse(document.getElementById('crowi-context-hydrate').textContent || '{}'));
if (isLoggedin) {
  crowi.fetchUsers();
}

const crowiRenderer = new CrowiRenderer(crowi);
window.crowiRenderer = crowiRenderer;

// FIXME
var isEnabledPlugins = $('body').data('plugin-enabled');
if (isEnabledPlugins) {
  var crowiPlugin = window.crowiPlugin;
  crowiPlugin.installAll(crowi, crowiRenderer);
}

// for PageEditor
const onSaveSuccess = function(page) {
  crowi.getCrowiForJquery().updateCurrentRevision(page.revision._id);
}

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
const componentMappings = {
  'search-top': <HeaderSearchBox crowi={crowi} />,
  'search-page': <SearchPage crowi={crowi} />,
  'page-list-search': <PageListSearch crowi={crowi} />,
  'page-comments-list': <PageComments pageId={pageId} revisionId={pageRevisionId} revisionCreatedAt= {pageRevisionCreatedAt} crowi={crowi} />,
  'page-attachment': <PageAttachment pageId={pageId} pageContent={pageContent} crowi={crowi} />,

  //'revision-history': <PageHistory pageId={pageId} />,
  'seen-user-list': <SeenUserList pageId={pageId} crowi={crowi} />,
  'bookmark-button': <BookmarkButton pageId={pageId} crowi={crowi} />,

  'page-name-inputter': <NewPageNameInputter crowi={crowi} parentPageName={pagePath} />,

};
// additional definitions if pagePath exists
if (pagePath) {
  componentMappings['revision-path'] = <RevisionPath pagePath={pagePath} crowi={crowi} />;
  componentMappings['revision-url'] = <RevisionUrl pageId={pageId} pagePath={pagePath} />;
}

let componentInstances = {};
Object.keys(componentMappings).forEach((key) => {
  const elem = document.getElementById(key);
  if (elem) {
    componentInstances[key] = ReactDOM.render(componentMappings[key], elem);
  }
});

// render components with refs to another component
const elem = document.getElementById('page-comment-form-behavior');
if (elem) {
  ReactDOM.render(<PageCommentFormBehavior crowi={crowi} pageComments={componentInstances['page-comments-list']} />, elem);
}

/*
 * PageEditor
 */
let pageEditor = null;
// load editorTheme
const editorTheme = crowi.loadEditorTheme();
// render PageEditor
const pageEditorElem = document.getElementById('page-editor');
if (pageEditorElem) {
  pageEditor = ReactDOM.render(
    <PageEditor crowi={crowi} pageId={pageId} revisionId={pageRevisionId} pagePath={pagePath}
        markdown={entities.decodeHTML(pageContent)} editorTheme={editorTheme}
        onSaveSuccess={onSaveSuccess} />,
    pageEditorElem
  );
  // set refs for pageEditor
  crowi.setPageEditor(pageEditor);
}
// render ThemeSelector
const themeSelectorElem = document.getElementById('page-editor-theme-selector');
if (themeSelectorElem) {
  ReactDOM.render(
    <ThemeSelector value={editorTheme}
        onChange={(value) => { // set onChange event handler
          pageEditor.setEditorTheme(value);
          crowi.saveEditorTheme(value);
        }} />,
    themeSelectorElem
  );
}

// render for admin
const customCssEditorElem = document.getElementById('custom-css-editor');
if (customCssEditorElem != null) {
  // get input[type=hidden] element
  const customCssInputElem = document.getElementById('inputCustomCss');

  ReactDOM.render(
    <CustomCssEditor inputElem={customCssInputElem} />,
    customCssEditorElem
  )
}
const customScriptEditorElem = document.getElementById('custom-script-editor');
if (customScriptEditorElem != null) {
  // get input[type=hidden] element
  const customScriptInputElem = document.getElementById('inputCustomScript');

  ReactDOM.render(
    <CustomScriptEditor inputElem={customScriptInputElem} />,
    customScriptEditorElem
  )
}

// うわーもうー
$('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', function() {
  ReactDOM.render(<PageHistory pageId={pageId} crowi={crowi} />, document.getElementById('revision-history'));
});
