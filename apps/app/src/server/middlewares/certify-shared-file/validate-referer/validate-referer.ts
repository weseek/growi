import loggerFactory from '~/utils/logger';

import { ValidReferer } from '../interfaces';

import { retrieveSiteUrl } from './retrieve-site-url';


const logger = loggerFactory('growi:middlewares:certify-shared-file:validate-referer');


export const validateReferer = (referer: string | undefined): ValidReferer | false => {
  // not null
  if (referer == null) {
    logger.debug('referer string is undefined');
    return false;
  }

  let refererUrl: URL;
  try {
    refererUrl = new URL(referer);
  }
  catch (err) {
    logger.error("The 'app:siteUrl' is invalid");
    return false;
  }

  // siteUrl
  const siteUrl = retrieveSiteUrl();
  if (siteUrl == null) {
    return false;
  }

  // if (refererUrl.hostname !== )

  // starts with /share/

  return {
    referer,
    shareLinkId,
  };
};
