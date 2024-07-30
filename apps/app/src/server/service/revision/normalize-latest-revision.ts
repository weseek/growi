import type { HydratedDocument, ObjectId } from 'mongoose';
import mongoose from 'mongoose';

import type { PageDocument, PageModel } from '~/server/models/page';
import { Revision } from '~/server/models/revision';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:service:revision:normalize-latest-revision');

/**
 * Normalize the latest revision which was borken by the migration script '20211227060705-revision-path-to-page-id-schema-migration--fixed-7549.js'
 *
 * @ref https://github.com/weseek/growi/pull/8998
 */
export const normalizeLatestRevision = async(pageId: string | ObjectId): Promise<void> => {

  if (await Revision.countDocuments({ pageId }) > 0) {
    return;
  }

  logger.info(`The page ('${pageId}') does not have any revisions. Normalization of the latest revision will be started.`);

  const Page = mongoose.model<HydratedDocument<PageDocument>, PageModel>('Page');
  const page = await Page.findOne({ _id: pageId });

  if (page == null) {
    logger.warn(`Normalization has been canceled since the page ('${pageId}') could not be found.`);
    return;
  }
  if (page.revision == null || await Revision.countDocuments({ _id: page.revision }) === 0) {
    logger.warn(`Normalization has been canceled since the Page.revision of the page ('${pageId}') could not be found.`);
    return;
  }

  // update Revision.pageId
  await Revision.updateOne({ _id: page.revision }, { $set: { pageId } }).exec();
};
