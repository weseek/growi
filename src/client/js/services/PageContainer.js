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

    this.state = {};

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
      isLiked: false,
      seenUserIds: [],
      likerUserIds: [],

      tags: [],
      templateTagData: mainContent.getAttribute('data-template-tags') || '',

      // latest(on remote) information
      remoteRevisionId: revisionId,
      revisionIdHackmdSynced: mainContent.getAttribute('data-page-revision-id-hackmd-synced'),
      lastUpdateUsername: undefined,
      pageIdOnHackmd: mainContent.getAttribute('data-page-id-on-hackmd'),
      hasDraftOnHackmd: !!mainContent.getAttribute('data-page-has-draft-on-hackmd'),
      isHackmdDraftUpdatingInRealtime: false,
    };

    this.initStateMarkdown();
    this.initStateOthers();

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

  initStateOthers() {
    const likeButtonElem = document.getElementById('like-button');
    if (likeButtonElem != null) {
      this.state.isLiked = likeButtonElem.dataset.liked === 'true';
    }

    const seenUserListElem = document.getElementById('seen-user-list');
    if (seenUserListElem != null) {
      const userIdsStr = seenUserListElem.dataset.userIds;
      this.state.seenUserIds = userIdsStr.split(',');
    }


    const likerListElem = document.getElementById('liker-list');
    if (likerListElem != null) {
      const userIdsStr = likerListElem.dataset.userIds;
      this.state.likerUserIds = userIdsStr.split(',');
    }
  }

  setLatestRemotePageData(page, user) {
    this.setState({
      remoteRevisionId: page.revision._id,
      revisionIdHackmdSynced: page.revisionHackmdSynced,
      lastUpdateUsername: user.name,
    });
  }

  addWebSocketEventHandlers() {
    const pageContainer = this;
    const websocketContainer = this.appContainer.getContainer('WebsocketContainer');
    const socket = websocketContainer.getWebSocket();

    socket.on('page:create', (data) => {
      // skip if triggered myself
      if (data.socketClientId != null && data.socketClientId === websocketContainer.getSocketClientId()) {
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
      if (data.socketClientId != null && data.socketClientId === websocketContainer.getSocketClientId()) {
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
      if (data.socketClientId != null && data.socketClientId === websocketContainer.getSocketClientId()) {
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
      if (data.socketClientId != null && data.socketClientId === websocketContainer.getSocketClientId()) {
        return;
      }

      logger.debug({ obj: data }, `websocket on 'page:editingWithHackmd'`); // eslint-disable-line quotes

      if (data.page.path === pageContainer.state.path) {
        pageContainer.setState({ isHackmdDraftUpdatingInRealtime: true });
      }
    });

  }

}
