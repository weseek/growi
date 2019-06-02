import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

import * as entities from 'entities';

const logger = loggerFactory('growi:services:PageContainer');

/**
 * Service container related to Page
 * @extends {Container} unstated Container
 */
export default class PageContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.appContainer.registerContainer(this);

    const mainContent = document.querySelector('#content-main');

    if (mainContent == null) {
      logger.debug('#content-main element is not exists');
      return;
    }

    const revisionId = mainContent.getAttribute('data-page-revision-id');

    this.state = {
      // local page data
      markdown: null, // will be initialized after initStateMarkdown()
      pageId: mainContent.getAttribute('data-page-id'),
      revisionId,
      revisionCreatedAt: +mainContent.getAttribute('data-page-revision-created'),
      path: mainContent.getAttribute('data-path'),

      tags: [],
      templateTagData: mainContent.getAttribute('data-template-tags') || '',

      isSlackEnabled: false,
      slackChannels: mainContent.getAttribute('data-slack-channels') || '',

      grant: 1, // default: public
      grantGroupId: null,
      grantGroupName: null,

      // latest(on remote) information
      remoteRevisionId: revisionId,
      revisionIdHackmdSynced: mainContent.getAttribute('data-page-revision-id-hackmd-synced'),
      lastUpdateUsername: undefined,
      pageIdOnHackmd: mainContent.getAttribute('data-page-id-on-hackmd'),
      hasDraftOnHackmd: !!mainContent.getAttribute('data-page-has-draft-on-hackmd'),
      isHackmdDraftUpdatingInRealtime: false,
    };

    this.initStateMarkdown();
    this.initStateGrant();
    this.initDrafts();

    this.addWebSocketEventHandlers = this.addWebSocketEventHandlers.bind(this);
    this.addWebSocketEventHandlers();
  }

  /**
   * initialize state for markdown data
   */
  initStateMarkdown() {
    let pageContent = '';

    const rawText = document.getElementById('raw-text-original');
    if (rawText) {
      pageContent = rawText.innerHTML;
    }
    const markdown = entities.decodeHTML(pageContent);

    this.state.markdown = markdown;
  }

  /**
   * initialize state for page permission
   */
  initStateGrant() {
    const elem = document.getElementById('save-page-controls');

    if (elem) {
      this.state.grant = +elem.dataset.grant;

      const grantGroupId = elem.dataset.grantGroup;
      if (grantGroupId != null && grantGroupId.length > 0) {
        this.state.grantGroupId = grantGroupId;
        this.state.grantGroupName = elem.dataset.grantGroupName;
      }
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

  getCurrentOptionsToSave() {
    const opt = {
      isSlackEnabled: this.state.isSlackEnabled,
      slackChannels: this.state.slackChannels,
      grant: this.state.grant,
    };

    if (this.state.grantGroupId != null) {
      opt.grantUserGroupId = this.state.grantGroupId;
    }

    return opt;
  }

  setLatestRemotePageData(page, user) {
    this.setState({
      remoteRevisionId: page.revision._id,
      revisionIdHackmdSynced: page.revisionHackmdSynced,
      lastUpdateUsername: user.name,
    });
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

  addWebSocketEventHandlers() {
    const pageContainer = this;
    const websocketContainer = this.appContainer.getContainer('WebsocketContainer');
    const socket = websocketContainer.getWebSocket();

    socket.on('page:create', (data) => {
      // skip if triggered myself
      if (data.socketClientId != null && data.socketClientId === websocketContainer.getCocketClientId()) {
        return;
      }

      logger.debug({ obj: data }, `websocket on 'page:create'`); // eslint-disable-line quotes

      // update PageStatusAlert
      if (data.page.path === pageContainer.state.path) {
        this.setLatestRemotePageData(data.page, data.user);
      }
    });

    socket.on('page:update', (data) => {
      // skip if triggered myself
      if (data.socketClientId != null && data.socketClientId === websocketContainer.getCocketClientId()) {
        return;
      }

      logger.debug({ obj: data }, `websocket on 'page:update'`); // eslint-disable-line quotes

      if (data.page.path === pageContainer.state.path) {
        // update PageStatusAlert
        pageContainer.setLatestRemotePageData(data.page, data.user);
        // update remote data
        const page = data.page;
        pageContainer.setState({
          remoteRevisionId: page.revision._id,
          revisionIdHackmdSynced: page.revisionHackmdSynced,
          hasDraftOnHackmd: page.hasDraftOnHackmd,
        });
      }
    });

    socket.on('page:delete', (data) => {
      // skip if triggered myself
      if (data.socketClientId != null && data.socketClientId === websocketContainer.getCocketClientId()) {
        return;
      }

      logger.debug({ obj: data }, `websocket on 'page:delete'`); // eslint-disable-line quotes

      // update PageStatusAlert
      if (data.page.path === pageContainer.state.path) {
        pageContainer.setLatestRemotePageData(data.page, data.user);
      }
    });

    socket.on('page:editingWithHackmd', (data) => {
      // skip if triggered myself
      if (data.socketClientId != null && data.socketClientId === websocketContainer.getCocketClientId()) {
        return;
      }

      logger.debug({ obj: data }, `websocket on 'page:editingWithHackmd'`); // eslint-disable-line quotes

      if (data.page.path === pageContainer.state.path) {
        pageContainer.setState({ isHackmdDraftUpdatingInRealtime: true });
      }
    });

  }

}
