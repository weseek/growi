import { Container } from 'unstated';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:services:EditorContainer');

/**
 * Service container related to options for Editor/Preview
 * @extends {Container} unstated Container
 */
export default class EditorContainer extends Container {

  constructor(appContainer, defaultEditorOptions, defaultPreviewOptions) {
    super();

    this.appContainer = appContainer;
    this.appContainer.registerContainer(this);

    const mainContent = document.querySelector('#content-main');

    if (mainContent == null) {
      logger.debug('#content-main element is not exists');
      return;
    }

    this.state = {
      tags: null,

      isSlackEnabled: false,
      slackChannels: mainContent.getAttribute('data-slack-channels') || '',

      grant: 1, // default: public
      grantGroupId: null,
      grantGroupName: null,

      editorOptions: {},
      previewOptions: {},
      indentSize: this.appContainer.config.adminPreferredIndentSize || 4,
    };

    this.isSetBeforeunloadEventHandler = false;

    this.initStateGrant();
    this.initDrafts();

    this.initEditorOptions('editorOptions', 'editorOptions', defaultEditorOptions);
    this.initEditorOptions('previewOptions', 'previewOptions', defaultPreviewOptions);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'EditorContainer';
  }

  /**
   * initialize state for page permission
   */
  initStateGrant() {
    const mainContent = document.getElementById('content-main');

    if (mainContent == null) {
      logger.debug('#content-main element is not exists');
      return;
    }

    this.state.grant = +mainContent.getAttribute('data-page-grant');

    const grantGroupId = mainContent.getAttribute('data-page-grant-group');
    if (grantGroupId != null && grantGroupId.length > 0) {
      this.state.grantGroupId = grantGroupId;
      this.state.grantGroupName = mainContent.getAttribute('data-page-grant-group-name');
    }
  }

  /**
   * initialize state for drafts
   */
  initDrafts() {
    this.drafts = {};

    // restore data from localStorage
    const contents = window.localStorage.drafts;
    if (contents != null) {
      try {
        this.drafts = JSON.parse(contents);
      }
      catch (e) {
        window.localStorage.removeItem('drafts');
      }
    }

    if (this.state.pageId == null) {
      const draft = this.findDraft(this.state.path);
      if (draft != null) {
        this.state.markdown = draft;
      }
    }
  }

  initEditorOptions(stateKey, localStorageKey, defaultOptions) {
    // load from localStorage
    const optsStr = window.localStorage[localStorageKey];

    let loadedOpts = {};
    // JSON.parseparse
    if (optsStr != null) {
      try {
        loadedOpts = JSON.parse(optsStr);
      }
      catch (e) {
        this.localStorage.removeItem(localStorageKey);
      }
    }

    // set to state obj
    this.state[stateKey] = Object.assign(defaultOptions, loadedOpts);
  }

  saveOptsToLocalStorage() {
    window.localStorage.setItem('editorOptions', JSON.stringify(this.state.editorOptions));
    window.localStorage.setItem('previewOptions', JSON.stringify(this.state.previewOptions));
  }

  setCaretLine(line) {
    const pageEditor = this.appContainer.getComponentInstance('PageEditor');
    if (pageEditor != null) {
      pageEditor.setCaretLine(line);
    }
  }

  focusToEditor() {
    const pageEditor = this.appContainer.getComponentInstance('PageEditor');
    if (pageEditor != null) {
      pageEditor.focusToEditor();
    }
  }

  getCurrentOptionsToSave() {
    const opt = {
      isSlackEnabled: this.state.isSlackEnabled,
      slackChannels: this.state.slackChannels,
      grant: this.state.grant,
      pageTags: this.state.tags,
    };

    if (this.state.grantGroupId != null) {
      opt.grantUserGroupId = this.state.grantGroupId;
    }

    return opt;
  }

  // See https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#example
  showUnsavedWarning(e) {
    // Cancel the event
    e.preventDefault();
    // display browser default message
    e.returnValue = '';
    return '';
  }

  disableUnsavedWarning() {
    window.removeEventListener('beforeunload', this.showUnsavedWarning);
    this.isSetBeforeunloadEventHandler = false;
  }

  enableUnsavedWarning() {
    if (!this.isSetBeforeunloadEventHandler) {
      window.addEventListener('beforeunload', this.showUnsavedWarning);
      this.isSetBeforeunloadEventHandler = true;
    }
  }

  clearDraft(path) {
    delete this.drafts[path];
    window.localStorage.setItem('drafts', JSON.stringify(this.drafts));
  }

  clearAllDrafts() {
    window.localStorage.removeItem('drafts');
  }

  saveDraft(path, body) {
    this.drafts[path] = body;
    window.localStorage.setItem('drafts', JSON.stringify(this.drafts));
  }

  findDraft(path) {
    if (this.drafts != null && this.drafts[path]) {
      return this.drafts[path];
    }

    return null;
  }

}
