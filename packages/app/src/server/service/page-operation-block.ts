import mongoose from 'mongoose';
import { PageQueryBuilder } from '../models/obsolete-page';
import { PageModel } from '../models/page';
import { PageOperationBlock } from '../models/page-operation-block';
import Crowi from '../crowi';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:services:PageOperationBlockService');


/**
 * the service class of UserGroupService
 */
class PageOperationBlockService {

  crowi: Crowi;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
  }


  findAncestersByPath = async function(path) {
    const Page = mongoose.model('Page') as PageModel;
    const queryBuilder = new PageQueryBuilder(Page.find());
    const ancestorPages = await queryBuilder
      .addConditionToListOnlyAncestors(path)
      .query
      .exec();
    const ancestorPaths = ancestorPages.map(page => page.path);
    return ancestorPaths;
  }

  findDescendantsByPath = async function(path) {
    const Page = mongoose.model('Page') as PageModel;
    const queryBuilder = new PageQueryBuilder(Page.find());
    const descendantPages = await queryBuilder
      .addConditionToListOnlyDescendants(path)
      .query
      .exec();
    const descendantPaths = descendantPages.map(page => page.path);
    return descendantPaths;
  }

  /*
    * return An array including ancestorPaths + path + descendantPaths
    * eg -> [/parent, /parent/{path}, /parent/{path}/grandChild]
  */
  findRelatedPaths = async function(path) {
    try {
      const ancestorPaths = await this.findAncestersByPath(path);
      const descendantPaths = await this.findDescendantsByPath(path);
      const relatedPaths = ancestorPaths.concat(path, descendantPaths);
      return relatedPaths;
    }
    catch (err) {
      logger.error(err);
    }
  }

  shouldBlockOperation = async(pagePath) => {
    try {
      const relatedPaths = await this.findRelatedPaths(pagePath);
      console.log('relatedPaths', relatedPaths);
      // blockingPath seems to be one element but set as an array just in case
      const blockingPaths = await PageOperationBlock.findActiveDocumentsByPaths(relatedPaths);
      console.log('blockingPaths_fuga', blockingPaths);
      return blockingPaths.length > 0;
    }
    catch (err) {
      logger.error(err);
    }
  }

}

module.exports = PageOperationBlockService;
