import * as fs from 'fs';
import path from 'path';

import { DevidedPagePath } from '@growi/core/dist/models';
// eslint-disable-next-line no-restricted-imports
import axios from 'axios';
import {
  Request, Response, NextFunction,
} from 'express';
import { param, validationResult, ValidationError } from 'express-validator';

import loggerFactory from '~/utils/logger';
import { projectRoot } from '~/utils/project-dir-utils';

import { convertStreamToBuffer } from '../util/stream';

const logger = loggerFactory('growi:routes:ogp');

const DEFAULT_USER_IMAGE_URL = '/images/icons/user.svg';
const DEFAULT_USER_IMAGE_PATH = `public${DEFAULT_USER_IMAGE_URL}`;

let bufferedDefaultUserImageCache: Buffer = Buffer.from('');
fs.readFile(path.join(projectRoot, DEFAULT_USER_IMAGE_PATH), (err, buffer) => {
  if (err) throw err;
  bufferedDefaultUserImageCache = buffer;
});


module.exports = function(crowi) {

  const isUserImageAttachment = (userImageUrlCached: string): boolean => {
    return /^\/attachment\/.+/.test(userImageUrlCached);
  };

  const getBufferedUserImage = async(userImageUrlCached: string): Promise<Buffer> => {

    let bufferedUserImage: Buffer;

    if (isUserImageAttachment(userImageUrlCached)) {
      const { fileUploadService } = crowi;
      const Attachment = crowi.model('Attachment');
      const attachment = await Attachment.findById(userImageUrlCached);
      const fileStream = await fileUploadService.findDeliveryFile(attachment);
      bufferedUserImage = await convertStreamToBuffer(fileStream);
      return bufferedUserImage;
    }

    return (await axios.get(
      userImageUrlCached, {
        responseType: 'arraybuffer',
      },
    )).data;

  };

  const renderOgp = async(req: Request, res: Response) => {

    const { configManager } = crowi;
    const ogpUri = configManager.getConfig('crowi', 'app:ogpUri');
    const page = req.body.page;

    let user;
    let pageTitle: string;
    let bufferedUserImage: Buffer;

    try {
      const User = crowi.model('User');
      user = await User.findById(page.creator._id.toString());

      bufferedUserImage = user.imageUrlCached === DEFAULT_USER_IMAGE_URL ? bufferedDefaultUserImageCache : (await getBufferedUserImage(user.imageUrlCached));
      // todo: consider page title
      pageTitle = (new DevidedPagePath(page.path)).latter;
    }
    catch (err) {
      logger.error(err);
      return res.status(500).send(`error: ${err}`);
    }

    let result;
    try {
      result = await axios.post(
        ogpUri, {
          data: {
            title: pageTitle,
            userName: user.username,
            userImage: bufferedUserImage,
          },
        }, {
          responseType: 'stream',
        },
      );
    }
    catch (err) {
      logger.error(err);
      return res.status(500).send(`error: ${err}`);
    }

    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
    });
    result.data.pipe(res);

  };

  const pageIdRequired = param('pageId').not().isEmpty().withMessage('page id is not included in the parameter');

  const ogpValidator = async(req:Request, res:Response, next:NextFunction) => {
    const { aclService, fileUploadService, configManager } = crowi;

    const ogpUri = configManager.getConfig('crowi', 'app:ogpUri');

    if (ogpUri == null) return res.status(400).send('OGP URI for GROWI has not been setup');
    if (!fileUploadService.getIsUploadable()) return res.status(501).send('This GROWI can not upload file');
    if (!aclService.isGuestAllowedToRead()) return res.status(501).send('This GROWI is not public');

    const errors = validationResult(req);

    if (errors.isEmpty()) {

      try {
        const Page = crowi.model('Page');
        const page = await Page.findByIdAndViewer(req.params.pageId);

        if (page == null || page.status !== Page.STATUS_PUBLISHED || (page.grant !== Page.GRANT_PUBLIC && page.grant !== Page.GRANT_RESTRICTED)) {
          return res.status(400).send('the page does not exist');
        }

        req.body.page = page;
      }
      catch (error) {
        logger.error(error);
        return res.status(500).send(`error: ${error}`);
      }

      return next();
    }

    // errors.array length is one bacause pageIdRequired is used
    const pageIdRequiredError: ValidationError = errors.array()[0];

    return res.status(400).send(pageIdRequiredError.msg);
  };

  return {
    renderOgp,
    pageIdRequired,
    ogpValidator,
  };

};
