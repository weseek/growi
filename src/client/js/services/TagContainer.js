import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

const logger = loggerFactory('growi:services:TagContainer');

/**
 * Service container related to Tag
 * @extends {Container} unstated Container
 */
export default class TagContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.appContainer.registerContainer(this);

    this.init();
  }

  /**
   * retrieve tags data
   * !! This method should be invoked after PageContainer and EditorContainer has been initialized !!
   */
  async init() {
    const pageContainer = this.appContainer.getContainer('PageContainer');
    const editorContainer = this.appContainer.getContainer('EditorContainer');

    const { pageId, templateTagData } = pageContainer.state;

    let tags;

    // when the page exists
    if (pageId != null) {
      const res = await this.appContainer.apiGet('/pages.getPageTag', { pageId });
      tags = res.tags;
    }
    // when the page not exist
    else if (templateTagData != null) {
      tags = templateTagData.split(',');
    }

    logger.debug('tags data has been initialized');

    pageContainer.setState({ tags });
    editorContainer.setState({ tags });
  }

}
