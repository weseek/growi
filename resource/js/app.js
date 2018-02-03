import React from 'react';
import ReactDOM from 'react-dom';

import Crowi from './util/Crowi';
// import CrowiRenderer from './util/CrowiRenderer';
import GrowiRenderer from './util/GrowiRenderer';

import HeaderSearchBox  from './components/HeaderSearchBox';
import SearchPage       from './components/SearchPage';
import PageEditor       from './components/PageEditor';
import OptionsSelector  from './components/PageEditor/OptionsSelector';
import { EditorOptions, PreviewOptions } from './components/PageEditor/OptionsSelector';
import Page             from './components/Page';
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
let markdown = '';
if (mainContent !== null) {
  pageId = mainContent.getAttribute('data-page-id');
  pageRevisionId = mainContent.getAttribute('data-page-revision-id');
  pageRevisionCreatedAt = +mainContent.getAttribute('data-page-revision-created');
  pagePath = mainContent.attributes['data-path'].value;
  const rawText = document.getElementById('raw-text-original');
  if (rawText) {
    pageContent = rawText.innerHTML;
  }
  markdown = entities.decodeHTML(pageContent);
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

const crowiRenderer = new GrowiRenderer(crowi, null, {
  mode: 'page',
  isAutoSetup: false,                                     // manually setup because plugins may configure it
  renderToc: crowi.getCrowiForJquery().renderTocContent,  // function for rendering Table Of Contents
});
window.crowiRenderer = crowiRenderer;

// FIXME
var isEnabledPlugins = $('body').data('plugin-enabled');
if (isEnabledPlugins) {
  var crowiPlugin = window.crowiPlugin;
  crowiPlugin.installAll(crowi, crowiRenderer);
}

// configure renderer
crowiRenderer.setup(crowi.config);

/**
 * define components
 *  key: id of element
 *  value: React Element
 */
const componentMappings = {
  'search-top': <HeaderSearchBox crowi={crowi} />,
  'search-page': <SearchPage crowi={crowi} crowiRenderer={crowiRenderer} />,
  'page-list-search': <PageListSearch crowi={crowi} />,

  //'revision-history': <PageHistory pageId={pageId} />,
  'seen-user-list': <SeenUserList pageId={pageId} crowi={crowi} />,
  'bookmark-button': <BookmarkButton pageId={pageId} crowi={crowi} />,

  'page-name-inputter': <NewPageNameInputter crowi={crowi} parentPageName={pagePath} />,

};
// additional definitions if data exists
if (pageId) {
  componentMappings['page-comments-list'] = <PageComments pageId={pageId} revisionId={pageRevisionId} revisionCreatedAt={pageRevisionCreatedAt} crowi={crowi} />;
  componentMappings['page-attachment'] = <PageAttachment pageId={pageId} pageContent={pageContent} crowi={crowi} />;
}
if (pagePath) {
  componentMappings['page'] = <Page crowi={crowi} crowiRenderer={crowiRenderer} markdown={markdown} pagePath={pagePath} showHeadEditButton={true} />;
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
const editorOptions = new EditorOptions(crowi.editorOptions);
const previewOptions = new PreviewOptions(crowi.previewOptions);
// render PageEditor
const pageEditorElem = document.getElementById('page-editor');
if (pageEditorElem) {
  // create onSave event handler
  const onSaveSuccess = function(page) {
    // modify the revision id value to pass checking id when updating
    crowi.getCrowiForJquery().updateCurrentRevision(page.revision._id);
    // re-render Page component
    componentInstances.page.setMarkdown(page.revision.body);
  }

  pageEditor = ReactDOM.render(
    <PageEditor crowi={crowi} crowiRenderer={crowiRenderer}
        pageId={pageId} revisionId={pageRevisionId} pagePath={pagePath}
        markdown={markdown}
        editorOptions={editorOptions} previewOptions={previewOptions}
        onSaveSuccess={onSaveSuccess} />,
    pageEditorElem
  );
  // set refs for pageEditor
  crowi.setPageEditor(pageEditor);
}
// render OptionsSelector
const pageEditorOptionsSelectorElem = document.getElementById('page-editor-options-selector');
if (pageEditorOptionsSelectorElem) {
  ReactDOM.render(
    <OptionsSelector crowi={crowi}
        editorOptions={editorOptions} previewOptions={previewOptions}
        onChange={(newEditorOptions, newPreviewOptions) => { // set onChange event handler
          // set options
          pageEditor.setEditorOptions(newEditorOptions);
          pageEditor.setPreviewOptions(newPreviewOptions);
          // save
          crowi.saveEditorOptions(newEditorOptions);
          crowi.savePreviewOptions(newPreviewOptions);
        }} />,
    pageEditorOptionsSelectorElem
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
