import mongoose from 'mongoose';
import { PageQueryBuilder } from '../models/obsolete-page';
import { PageModel } from '../models/page';
import { PageOperationBlock } from '../models/page-operation-block';
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
    // find existing ancesters and descendants
    const queryBuilderForAncestors = new PageQueryBuilder(Page.find());
    const pageQueryBuilderForDescendants = new PageQueryBuilder(Page.find());

    const ancestorPages = await queryBuilderForAncestors
      .addConditionToListOnlyAncestors(path)
      .query
      .exec();

    const descendantPages = await pageQueryBuilderForDescendants
      .addConditionToListOnlyDescendants(path)
      .query
      .exec();

    const ancestorPaths = ancestorPages.map((page) => { return page.path });
    const descendantPaths = descendantPages.map((page) => { return page.path });

    /*
    * return An array including ancestor and descendant paths
    * eg -> [/parent, /parent/{path}, /parent/{path}/grandChild]
    */
    return ancestorPaths.concat(descendantPaths);
  }


  shouldBlockOperation = async(pagePath) => {
    const blockTargetPaths = await this.findBlockTargetPaths(pagePath);
    console.log('shouldBlockOperation_blockTargetPaths', blockTargetPaths);


    // if (blockTargetPaths != null) {
    //   const activeDocuments = PageOperationBlock.findDocuments(blockTargetPaths);

    // const isActive = elm => elm.isActive === true;


    // if (activeDocuments.some(isActive)) {
    //   return true;
    // }

    // 一つでも該当していたらtrueを返す
    // }
    // 1. 一つもドキュメントが存在しない && ドキュメントが存在するけどisActiveがfalseだったら、falseを返す
    // 2.isActiveがfalseのドキュメントは削除する
    return false;
  }

}

module.exports = PageOperationBlockService;
