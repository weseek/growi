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

  // starts with /share/

  return {
    referer,
    shareLinkId,
  };
};
