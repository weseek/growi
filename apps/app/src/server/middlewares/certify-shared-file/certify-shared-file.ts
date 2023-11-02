import type { IAttachment } from '@growi/core';
import type { NextFunction, Request, Response } from 'express';

import type { IShareLink } from '~/interfaces/share-link';
import loggerFactory from '~/utils/logger';

import { getModelSafely } from '../../util/mongoose-utils';


const logger = loggerFactory('growi:middleware:certify-shared-fire');


interface RequestToAllowShareLink extends Request {
  isSharedPage?: boolean,
}

export const certifySharedFileMiddleware = async(req: RequestToAllowShareLink, res: Response, next: NextFunction): Promise<void> => {

  const { referer } = req.headers;

  // Attachments cannot be viewed by clients who do not send referer.
  // https://github.com/weseek/growi/issues/2819
  if (referer == null) {
    return next();
  }

  const refererUrl = new URL(referer);

  if (!refererUrl.pathname.startsWith('/share/')) {
    return next();
  }

  const fileId = req.params.id || null;

  const Attachment = getModelSafely<IAttachment>('Attachment');
  const ShareLink = getModelSafely<IShareLink>('ShareLink');

  if (Attachment == null) {
    logger.warn('Could not get Attachment model. next() is called without processing anything.');
    return next();
  }
  if (ShareLink == null) {
    logger.warn('Could not get Attachment model. next() is called without processing anything.');
    return next();
  }

  const attachment = await Attachment.findOne({ _id: fileId });

  if (attachment == null) {
    return next();
  }

  const shareLinks = await ShareLink.find({ relatedPage: attachment.page });

  // If sharelinks don't exist, skip it
  if (shareLinks.length === 0) {
    return next();
  }

  // Is there a valid share link
  shareLinks.map((sharelink) => {
    if (!sharelink.isExpired()) {
      logger.debug('Confirmed target file belong to a share page');
      req.isSharedPage = true;
    }
    return;
  });

  next();

};
