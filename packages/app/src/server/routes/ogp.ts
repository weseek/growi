import {
  Request, Response,
} from 'express';
import path from 'path';
import { promises as fsPromise } from 'fs';

import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';
import { projectRoot } from '~/utils/project-dir-utils';
import { generatePageTitleFromPagePath } from '~/utils/page-title-utils';
import ApiResponse from '../util/apiResponse';
import { convertStreamToBuffer } from '../util/stream';
import { isUserImageGravatar, isUserImageAttachment, isUserImageDefault } from '../util/user-image-url';

const logger = loggerFactory('growi:routes:ogp');

const DEFAULT_IMAGE_PATH = 'public/images/icons/user.svg';

module.exports = function(crowi) {
  const { configManager, aclService } = crowi;

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
      let bufferedUserImage: Buffer = Buffer.from('');

      try {
        const Page = crowi.model('Page');
        const page = await Page.findByIdAndViewer(pageId);

        if (page.status !== 'published' || (page.grant !== 1 && page.grant !== 2)) {
          return res.status(400).send('the page does not e xist');
        }

        const User = crowi.model('User');
        user = await User.findById(page.creator._id.toString());

        if (isUserImageGravatar(user.imageUrlCached)) {
          bufferedUserImage = (await axios.get(
            user.imageUrlCached, {
              responseType: 'arraybuffer',
            },
          )).data;
        }
        else if (isUserImageAttachment(user.imageUrlCached)) {
          const { fileUploadService } = crowi;
          const Attachment = crowi.model('Attachment');
          const attachment = await Attachment.findById(user.imageAttachment);
          const fileStream = await fileUploadService.findDeliveryFile(attachment);
          bufferedUserImage = await convertStreamToBuffer(fileStream);
        }
        else if (isUserImageDefault(user.imageUrlCached)) {
          bufferedUserImage = await fsPromise.readFile(
            path.join(projectRoot, DEFAULT_IMAGE_PATH),
          );
        }
        else {
          throw new Error('imageUrlCached is invalid value');
        }

        pageTitle = generatePageTitleFromPagePath(page.path);

      }
      catch (err) {
        logger.error(err);
        return res.status(500).send(ApiResponse.error(`error: ${err}`));
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
        return res.status(500).send(ApiResponse.error(`error: ${err}`));
      }

      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
      });
      result.data.pipe(res);
    },
  };
};
