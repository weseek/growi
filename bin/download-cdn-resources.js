/**
 * the tool for download CDN resources and save as file
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
require('module-alias/register');

const logger = require('@alias/logger')('growi:bin:download-resources');

// check env var
const noCdn = !!process.env.NO_CDN;
if (!noCdn) {
  logger.info('Using CDN. No resources are downloaded.');
  // exit
  process.exit(0);
}

const CdnResourcesService = require('@commons/service/cdn-resources-service');

const service = new CdnResourcesService();

logger.info('Start to download.');

service.downloadAndWriteAll()
  .then(() => {
    logger.info('Download is terminated successfully');
  })
  .catch(err => {
    logger.error(err);
  });
