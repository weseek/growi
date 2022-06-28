import { Container } from 'unstated';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:services:EditorContainer');


/**
 * Service container related to options for Editor/Preview
 * @extends {Container} unstated Container
 */
export default class EditorContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.appContainer.registerContainer(this);

    this.state = {
      tags: null,
    };

    this.isSetBeforeunloadEventHandler = false;

    this.initDrafts();

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'EditorContainer';
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


  // See https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#example
  showUnsavedWarning(e) {
    // Cancel the event
    e.preventDefault();

    // display browser default message
    // Chrome requires returnValue to be set. -> https://www.bugbugnow.net/2022/01/beforeunload-dialog.html
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
