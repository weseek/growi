/**
 * the tool for download CDN resources and save as file
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */

require('module-alias/register');

const logger = require('@alias/logger')('growi:bin:download-resources');
const CdnResourcesResolver = require('@commons/service/cdn-resources-resolver');

const resolver = new CdnResourcesResolver();

logger.info('Start to download.');

resolver.downloadAndWriteAll()
  .then(() => {
    logger.info('Download is terminated successfully');
  })
  .catch(err => {
    logger.error(err);
  });
