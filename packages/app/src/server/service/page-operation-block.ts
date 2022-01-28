// import PaageOperationBlock from '../models/page-operation-block';
import Crowi from '../crowi';
// import loggerFactory from '~/utils/logger'; // eslint-disable-line no-unused-vars

// const logger = loggerFactory('growi:service:PageOperationService');


/**
 * the service class of UserGroupService
 */
class PageOperationBlockService {

  crowi: Crowi;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
  }


  shouldBlockOperation = (pagePath) => {
  }

}

module.exports = PageOperationBlockService;
