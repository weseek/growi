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
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'TagContainer';
  }

  /**
   * retrieve tags data
   * !! This method should be invoked after PageContainer and EditorContainer has been initialized !!
   */
  async init() {
    const pageContainer = this.appContainer.getContainer('PageContainer');
    const editorContainer = this.appContainer.getContainer('EditorContainer');

    if (Object.keys(pageContainer.state).length === 0) {
      logger.debug('There is no need to initialize TagContainer because this is not a Page');
      return;
    }

    const { pageId, templateTagData } = pageContainer.state;

    let tags = [];
    // when the page exists
    if (pageId != null) {
      const res = await this.appContainer.apiGet('/pages.getPageTag', { pageId });
      tags = res.tags;
    }
    // when the page not exist
    else if (templateTagData != null) {
      tags = templateTagData.split(',').filter((str) => {
        return str !== ''; // filter empty values
      });
    }

    logger.debug('tags data has been initialized');

    pageContainer.setState({ tags });
    editorContainer.setState({ tags });
  }

}
