import {
  getIdForRef, type IPage, type IUser,
} from '@growi/core';
import express from 'express';
import type {
  NextFunction, Request, Response, Router,
} from 'express';
import mongoose from 'mongoose';

import { SupportedAction } from '~/interfaces/activity';
import type { CrowiProperties } from '~/interfaces/crowi-request';
import loggerFactory from '~/utils/logger';

import type Crowi from '../../crowi';
import { certifySharedPageAttachmentMiddleware } from '../../middlewares/certify-shared-page-attachment';
import { Attachment, type IAttachmentDocument } from '../../models';
import ApiResponse from '../../util/apiResponse';


const logger = loggerFactory('growi:routes:attachment:get');


interface PageModel {
  isAccessiblePageByViewer: (pageId: string, user: IUser | undefined) => Promise<boolean>
}

type LocalsAfterDataInjection = { attachment: IAttachmentDocument };

type ValidateGetRequest = CrowiProperties & Request<
  { id: string },
  any, any, any,
  LocalsAfterDataInjection
>;

type ValidateGetResponse = Response<
  any,
  LocalsAfterDataInjection
>;

export const validateGetRequest = async(req: ValidateGetRequest, res: ValidateGetResponse, next: NextFunction): Promise<void> => {
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


type GetRequest = CrowiProperties & Request<
  { id: string },
  any, any, any,
  LocalsAfterDataInjection
>;

type GetResponse = Response<
  any,
  LocalsAfterDataInjection
>

export const setCommonHeadersToRes = (res: GetResponse): void => {
  const { attachment } = res.locals;

  res.set({
    ETag: `Attachment-${attachment._id}`,
    'Last-Modified': attachment.createdAt.toUTCString(),
  });

  if (attachment.fileSize) {
    res.set({
      'Content-Length': attachment.fileSize,
    });
  }

  // // download
  // if (forceDownload) {
  //   res.set({
  //     'Content-Disposition': `attachment;filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
  //   });
  // }
  // // reference
  // else {
  //   res.set({
  //     'Content-Type': attachment.fileFormat,
  //     // eslint-disable-next-line max-len
  //     'Content-Security-Policy': "script-src 'unsafe-hashes'; style-src 'self' 'unsafe-inline'; object-src 'none'; require-trusted-types-for 'script'; media-src 'self'; default-src 'none';",
  //     'Content-Disposition': `inline;filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
  //   });
  // }
};


export const getRouterFactory = (crowi: Crowi): Router => {

  const loginRequired = require('../../middlewares/login-required')(crowi, true);

  const router = express.Router();


  const generateActivityParameters = (req: GetRequest) => {
    return {
      ip:  req.ip,
      endpoint: req.originalUrl,
      action: SupportedAction.ACTION_ATTACHMENT_DOWNLOAD,
      user: req.user?._id,
      snapshot: {
        username: req.user?.username,
      },
    };
  };


  // note: validateGetRequest requires `req.params.id`
  router.get<{ id: string }>('/:id([0-9a-z]{24})',
    certifySharedPageAttachmentMiddleware, loginRequired, validateGetRequest,
    async(req: GetRequest, res: GetResponse) => {
      const { attachment } = res.locals;

      const { fileUploadService } = crowi;

      // add headers before evaluating 'req.fresh'
      setCommonHeadersToRes(res);

      res.set({
        'Content-Type': attachment.fileFormat,
        // eslint-disable-next-line max-len
        'Content-Security-Policy': "script-src 'unsafe-hashes'; style-src 'self' 'unsafe-inline'; object-src 'none'; require-trusted-types-for 'script'; media-src 'self'; default-src 'none';",
        'Content-Disposition': `inline;filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
      });

      const activityParameters = generateActivityParameters(req);
      const createActivity = async() => {
        await crowi.activityService.createActivity(activityParameters);
      };

      // return 304 if request is "fresh"
      // see: http://expressjs.com/en/5x/api.html#req.fresh
      if (req.fresh) {
        res.sendStatus(304);
        createActivity();
        return;
      }

      if (fileUploadService.canRespond()) {
        fileUploadService.respond(res, attachment);
        createActivity();
        return;
      }

      try {
        const readable = await fileUploadService.findDeliveryFile(attachment);
        readable.pipe(res);
      }
      catch (e) {
        logger.error(e);
        return res.json(ApiResponse.error(e.message));
      }

      createActivity();
      return;
    });

  return router;
};
