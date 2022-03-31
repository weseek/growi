/**
 * the tool for download CDN resources and save as file
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
import { envUtils } from '@growi/core';

import CdnResourcesDownloader from './cdn/cdn-resources-downloader';
import loggerFactory from '../src/utils/logger';

const logger = loggerFactory('growi:bin:download-cdn-resources');

// check env var
const noCdn: boolean = envUtils.toBoolean(process.env.NO_CDN);
if (!noCdn) {
  logger.info('Using CDN. No resources are downloaded.');
  // exit
  process.exit(0);
}

logger.info('This is NO_CDN mode. Start to download resources.');


const downloader = new CdnResourcesDownloader();

downloader.downloadAndWriteAll()
  .then(() => {
    logger.info('Download is completed successfully');
  })
  .catch((err) => {
    logger.error(err);
  });
