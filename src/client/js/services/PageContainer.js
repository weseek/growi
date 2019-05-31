import { Container } from 'unstated';

import * as entities from 'entities';

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
      return;
    }


    this.state = {
      markdown: null, // will be initialized after initStateMarkdown()
      pageId: mainContent.getAttribute('data-page-id'),
      revisionId: mainContent.getAttribute('data-page-revision-id'),
      revisionCreatedAt: +mainContent.getAttribute('data-page-revision-created'),
      revisionIdHackmdSynced: mainContent.getAttribute('data-page-revision-id-hackmd-synced'),
      pageIdOnHackmd: mainContent.getAttribute('data-page-id-on-hackmd'),
      hasDraftOnHackmd: !!mainContent.getAttribute('data-page-has-draft-on-hackmd'),
      path: mainContent.getAttribute['data-path'],
      templateTagData: mainContent.getAttribute('data-template-tags') || '',

      isSlackEnabled: false,
      slackChannels: mainContent.getAttribute('data-slack-channels') || '',

      grant: 1, // default: public
      grantGroupId: null,
      grantGroupName: null,
    };

    this.initStateMarkdown();
    this.initStateGrant();
  }

  initStateMarkdown() {
    let pageContent = '';

    const rawText = document.getElementById('raw-text-original');
    if (rawText) {
      pageContent = rawText.innerHTML;
    }
    const markdown = entities.decodeHTML(pageContent);

    this.state.markdown = markdown;
  }

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

}
