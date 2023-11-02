import type { NextFunction, Request, Response } from 'express';

import loggerFactory from '~/utils/logger';

import { retrieveValidShareLinkByReferer } from './retrieve-valid-share-link';
import { validateAttachment } from './validate-attachment';
import { validateReferer } from './validate-referer';


const logger = loggerFactory('growi:middleware:certify-shared-fire');


export interface RequestToAllowShareLink extends Request {
  isSharedPage?: boolean,
}

export const certifySharedFileMiddleware = async(req: RequestToAllowShareLink, res: Response, next: NextFunction): Promise<void> => {

  const fileId: string | undefined = req.params.id;
  const { referer } = req.headers;

  if (fileId == null) {
    logger.error('The param fileId is required. Please confirm to usage of this middleware.');
    return next();
  }

  const validReferer = validateReferer(referer);
  if (!validReferer) {
    logger.info('invalid referer.');
    return next();
  }

  logger.info('referer is valid.');

  // // Attachments cannot be viewed by clients who do not send referer.
  // // https://github.com/weseek/growi/issues/2819
  // if (referer == null) {
  //   return next();
  // }

  // const refererUrl = new URL(referer);

  // if (!refererUrl.pathname.startsWith('/share/')) {
  //   return next();
  // }

  const shareLink = retrieveValidShareLinkByReferer(validReferer);
  if (shareLink == null) {
    logger.info(`No valid ShareLink document found by the referer (${validReferer.referer}})`);
    return next();
  }

  if (!validateAttachment(fileId, shareLink)) {
    logger.info(`No valid ShareLink document found by the fileId (${fileId}) and referer (${validReferer.referer}})`);
    return next();
  }

  // const Attachment = getModelSafely<IAttachment>('Attachment');
  // if (Attachment == null) {
  //   logger.warn('Could not get Attachment model. next() is called without processing anything.');
  //   return next();
  // }

  // const attachment = await Attachment.findOne({ _id: fileId });

  // if (attachment == null) {
  //   return next();
  // }

  // const shareLinks = await ShareLink.find({ relatedPage: attachment.page });

  // // If sharelinks don't exist, skip it
  // if (shareLinks.length === 0) {
  //   return next();
  // }

  // // Is there a valid share link
  // shareLinks.map((sharelink) => {
  //   if (!sharelink.isExpired()) {
  //     logger.debug('Confirmed target file belong to a share page');
  //     req.isSharedPage = true;
  //   }
  //   return;
  // });

  req.isSharedPage = true;
  next();

};
