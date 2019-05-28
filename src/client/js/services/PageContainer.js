import { Container } from 'unstated';

import * as entities from 'entities';

/**
 * Service container related to Page
 * @extends {Container} unstated Container
 */
export default class PageContainer extends Container {

  constructor() {
    super();

    const mainContent = document.querySelector('#content-main');

    if (mainContent == null) {
      return;
    }

    let pageContent = '';
    const rawText = document.getElementById('raw-text-original');
    if (rawText) {
      pageContent = rawText.innerHTML;
    }

    this.state = {
      markdown: entities.decodeHTML(pageContent),

      pageId: mainContent.getAttribute('data-page-id'),
      revisionId: mainContent.getAttribute('data-page-revision-id'),
      revisionCreatedAt: +mainContent.getAttribute('data-page-revision-created'),
      revisionIdHackmdSynced: mainContent.getAttribute('data-page-revision-id-hackmd-synced'),
      pageIdOnHackmd: mainContent.getAttribute('data-page-id-on-hackmd'),
      hasDraftOnHackmd: !!mainContent.getAttribute('data-page-has-draft-on-hackmd'),
      path: mainContent.getAttribute['data-path'],
      slackChannels: mainContent.getAttribute('data-slack-channels') || '',
      templateTagData: mainContent.getAttribute('data-template-tags') || '',
    };

  }

}
