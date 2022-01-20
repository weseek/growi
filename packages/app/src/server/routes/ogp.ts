import {
  Request, Response,
} from 'express';

import path from 'path';
import * as fs from 'fs';

import { DevidedPagePath } from '@growi/core';
import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';
import { projectRoot } from '~/utils/project-dir-utils';
import { convertStreamToBuffer } from '../util/stream';

const logger = loggerFactory('growi:routes:ogp');

const DEFAULT_USER_IMAGE_URL = '/images/icons/user.svg';
const DEFAULT_USER_IMAGE_PATH = `public${DEFAULT_USER_IMAGE_URL}`;

// default user image is cached
let bufferedUserImage: Buffer = Buffer.from('');
fs.readFile(path.join(projectRoot, DEFAULT_USER_IMAGE_PATH), (err, buffer) => {
  if (err) throw err;
  bufferedUserImage = buffer;
});

module.exports = function(crowi) {
  const { configManager, aclService } = crowi;

  const isUserImageAttachment = (userImageUrlCached: string): boolean => {
    return /^\/attachment\/.+/.test(userImageUrlCached);
  };

  const ogpUri = configManager.getConfig('crowi', 'app:ogpUri');
  if (ogpUri == null) {
    return {
      renderOgp: (req: Request, res: Response) => {
        return res.status(400).send('OGP URI for GROWI has not been setup');
      },
    };
  }

  return {
    async renderOgp(req: Request, res: Response) {

      if (!aclService.isGuestAllowedToRead()) {
        return res.status(400).send('This GROWI is not public');
      }

      const pageId = req.params.pageId;
      if (pageId === '') {
        return res.status(400).send('page id is not included in the parameter');
      }

      let user;
      let pageTitle: string;

      try {
        const Page = crowi.model('Page');
        const page = await Page.findByIdAndViewer(pageId);

        if (page == null || page.status !== Page.STATUS_PUBLISHED || (page.grant !== Page.GRANT_PUBLIC && page.grant !== Page.GRANT_RESTRICTED)) {
          return res.status(400).send('the page does not e xist');
        }

        const User = crowi.model('User');
        user = await User.findById(page.creator._id.toString());

        if (user.imageUrlCached === DEFAULT_USER_IMAGE_URL) {
          // use cached default user bufferedUserImage
        }
        else if (isUserImageAttachment(user.imageUrlCached)) {
          const { fileUploadService } = crowi;
          const Attachment = crowi.model('Attachment');
          const attachment = await Attachment.findById(user.imageAttachment);
          const fileStream = await fileUploadService.findDeliveryFile(attachment);
          bufferedUserImage = await convertStreamToBuffer(fileStream);
        }
        else {
          bufferedUserImage = (await axios.get(
            user.imageUrlCached, {
              responseType: 'arraybuffer',
            },
          )).data;
        }

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
    },
  };
};
