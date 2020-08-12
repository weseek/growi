/**
 * the tool for download CDN resources and save as file
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:bin:download-cdn-resources');

const { envUtils } = require('growi-commons');

// check env var
const noCdn = envUtils.toBoolean(process.env.NO_CDN);
if (!noCdn) {
  logger.info('Using CDN. No resources are downloaded.');
  // exit
  process.exit(0);
}

logger.info('This is NO_CDN mode. Start to download resources.');

const CdnResourcesDownloader = require('~/service/cdn-resources-downloader');
const CdnResourcesService = require('~/service/cdn-resources-service');

const downloader = new CdnResourcesDownloader();
const service = new CdnResourcesService();

service.downloadAndWriteAll(downloader)
  .then(() => {
    logger.info('Download is completed successfully');
  })
  .catch((err) => {
    logger.error(err);
  });
