// import PaageOperationBlock from '../models/page-operation-block';
import mongoose from 'mongoose';
import { PageQueryBuilder } from '../models/obsolete-page';
import { PageModel } from '../models/page';
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


  findBlockTargetPaths = async function(path) {
    const Page = mongoose.model('Page') as PageModel;

    const pageQueryBuilder = new PageQueryBuilder(Page.find(), false);

    const blockTargetPaths = await pageQueryBuilder
      .addConditionToListOnlyAncestors(path)
      .addConditionToListOnlyDescendants();

    // extractToAncestorsPaths
    // addConditionToListOnlyDescendants

    // console.log('pageQueryBuilder', pageQueryBuilder);

    return blockTargetPaths;
  }

  shouldBlockOperation = (pagePath) => {
  }

}

module.exports = PageOperationBlockService;
