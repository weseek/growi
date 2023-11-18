import {
  getIdForRef, type IPage, type IUser,
} from '@growi/core';
import express from 'express';
import type {
  NextFunction, Request, Response, Router,
} from 'express';
import mongoose from 'mongoose';

import type { CrowiProperties, CrowiRequest } from '~/interfaces/crowi-request';
import loggerFactory from '~/utils/logger';

import type Crowi from '../../crowi';
import { certifySharedPageAttachmentMiddleware } from '../../middlewares/certify-shared-page-attachment';
import { Attachment, type IAttachmentDocument } from '../../models';
import ApiResponse from '../../util/apiResponse';


const logger = loggerFactory('growi:routes:attachment:get');


// TODO: remove this local interface when models/page has typescriptized
interface PageModel {
  isAccessiblePageByViewer: (pageId: string, user: IUser | undefined) => Promise<boolean>
}

type LocalsAfterDataInjection = { attachment: IAttachmentDocument };

type RetrieveAttachmentFromIdParamRequest = CrowiProperties & Request<
  { id: string },
  any, any, any,
  LocalsAfterDataInjection
>;

type RetrieveAttachmentFromIdParamResponse = Response<
  any,
  LocalsAfterDataInjection
>;

export const retrieveAttachmentFromIdParam = async(
    req: RetrieveAttachmentFromIdParamRequest, res: RetrieveAttachmentFromIdParamResponse, next: NextFunction,
): Promise<void> => {

  const id = req.params.id;
  const attachment = await Attachment.findById(id);

  if (attachment == null) {
    res.json(ApiResponse.error('attachment not found'));
    return;
  }

  const user = req.user;

  // check viewer has permission
  if (user != null && attachment.page != null) {
    const Page = mongoose.model<IPage, PageModel>('Page');
    const isAccessible = await Page.isAccessiblePageByViewer(getIdForRef(attachment.page), user);
    if (!isAccessible) {
      res.json(ApiResponse.error(`Forbidden to access to the attachment '${attachment.id}'. This attachment might belong to other pages.`));
      return;
    }
  }

  res.locals.attachment = attachment;

  return next();
};


export const setCommonHeadersToRes = (res: Response, attachment: IAttachmentDocument): void => {
  res.set({
    'Content-Type': attachment.fileFormat,
    // eslint-disable-next-line max-len
    'Content-Security-Policy': "script-src 'unsafe-hashes'; style-src 'self' 'unsafe-inline'; object-src 'none'; require-trusted-types-for 'script'; media-src 'self'; default-src 'none';",
    ETag: `Attachment-${attachment._id}`,
    'Last-Modified': attachment.createdAt.toUTCString(),
  });

  if (attachment.fileSize) {
    res.set({
      'Content-Length': attachment.fileSize,
    });
  }
};


export const getActionFactory = (crowi: Crowi, attachment: IAttachmentDocument) => {
  return async(req: CrowiRequest, res: Response): Promise<void> => {

    const { fileUploadService } = crowi;

    // add headers before evaluating 'req.fresh'
    setCommonHeadersToRes(res, attachment);

    // return 304 if request is "fresh"
    // see: http://expressjs.com/en/5x/api.html#req.fresh
    if (req.fresh) {
      res.sendStatus(304);
      return;
    }

    if (fileUploadService.canRespond()) {
      fileUploadService.respond(res, attachment);
      return;
    }

    try {
      const readable = await fileUploadService.findDeliveryFile(attachment);
      readable.pipe(res);
    }
    catch (e) {
      logger.error(e);
      res.json(ApiResponse.error(e.message));
      return;
    }

    return;
  };
};


export type GetRequest = CrowiProperties & Request<
  { id: string },
  any, any, any,
  LocalsAfterDataInjection
>;

export type GetResponse = Response<
  any,
  LocalsAfterDataInjection
>

export const getRouterFactory = (crowi: Crowi): Router => {

  const loginRequired = require('../../middlewares/login-required')(crowi, true);

  const router = express.Router();

  // note: retrieveAttachmentFromIdParam requires `req.params.id`
  router.get<{ id: string }>('/:id([0-9a-z]{24})',
    certifySharedPageAttachmentMiddleware, loginRequired,
    retrieveAttachmentFromIdParam,

    (req: GetRequest, res: GetResponse) => {
      const { attachment } = res.locals;

      res.set({
        'Content-Disposition': `inline;filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
      });

      const getAction = getActionFactory(crowi, attachment);
      getAction(req, res);
    });

  return router;
};
