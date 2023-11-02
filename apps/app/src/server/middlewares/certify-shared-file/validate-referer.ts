import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

import { ValidReferer } from './interfaces';


const logger = loggerFactory('growi:middlewares:certify-shared-file:validate-referer');


export const validateReferer = (referer: string | undefined): ValidReferer | false => {
  // not null
  if (referer == null) {
    logger.debug('referer string is undefined');
    return false;
  }

  // siteUrl
  const siteUrlString = configManager.getConfig('crowi', 'app:siteUrl');
  if (siteUrlString == null) {
    logger.warn("Verification referer does not work because 'Site URL' is NOT set. All of attachments in share link page is invisible.");
    return false;
  }

  let siteUrl: URL;
  try {
    siteUrl = new URL(siteUrlString);
  }
  catch (err) {
    logger.error("The 'app:siteUrl' is invalid");
    throw err;
  }
  let refererUrl: URL;
  try {
    refererUrl = new URL(referer);
  }
  catch (err) {
    logger.error("The 'app:siteUrl' is invalid");
    throw err;
  }

  // if (refererUrl.hostname !== )

  // starts with /share/

  return {
    referer,
    shareLinkId,
  };
};
