/**
 * the tool for download CDN resources and save as file
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
require('module-alias/register');

const logger = require('@alias/logger')('growi:bin:download-cdn-resources');

const { envUtils } = require('growi-commons');

// check env var
const noCdn = envUtils.toBoolean(process.env.NO_CDN);
if (!noCdn) {
  logger.info('Using CDN. No resources are downloaded.');
  // exit
  process.exit(0);
}

logger.info('This is NO_CDN mode. Start to download resources.');

const CdnResourcesDownloader = require('@commons/service/cdn-resources-downloader');
const CdnResourcesService = require('@commons/service/cdn-resources-service');

const downloader = new CdnResourcesDownloader();
const service = new CdnResourcesService();

service.downloadAndWriteAll(downloader)
  .then(() => {
    logger.info('Download is terminated successfully');
  })
  .catch((err) => {
    logger.error(err);
  });
