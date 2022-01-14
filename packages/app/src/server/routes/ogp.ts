import {
  Request, Response,
} from 'express';
import path from 'path';
import { promises as fsPromise } from 'fs';

import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';
import { projectRoot } from '~/utils/project-dir-utils';

const logger = loggerFactory('growi:routes:ogp');

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

      // this closure will be moved
      function stream2buffer(stream): Promise<Buffer> {

        return new Promise((resolve, reject) => {

          const _buf: Buffer[] = [];

          stream.on('data', (chunk) => {
            _buf.push(chunk);
          });
          stream.on('end', () => resolve(Buffer.concat(_buf)));
          stream.on('error', err => reject(err));

        });
      }

      if (!aclService.isGuestAllowedToRead()) {
        return res.status(400).send('This GROWI is not public');
      }

      const pageId = req.params.pageId;
      if (pageId === '') {
        return res.status(400).send('page id is not included in the parameter');
      }


      let user;
      let pageTitle;
      let bufferedUserImage: Buffer = Buffer.from('');

      try {
        const Page = crowi.model('Page');
        const page = await Page.findByIdAndViewer(pageId);

        if (page.status !== 'published' || (page.grant !== 1 && page.grant !== 2)) {
          return res.status(400).send('the page does not e xist');
        }

        const User = crowi.model('User');
        user = await User.findById(page.creator._id.toString());

        if (/^https:\/\/gravatar\.com\/avatar\/.+/.test(user.imageUrlCached)) {
          // user image is gravatar
          bufferedUserImage = (await axios.get(
            user.imageUrlCached, {
              responseType: 'arraybuffer',
            },
          )).data;
        }
        else if (/^\/attachment\/.+/.test(user.imageUrlCached)) {
          const { fileUploadService } = crowi;
          const Attachment = crowi.model('Attachment');
          const attachment = await Attachment.findById(user.imageAttachment);
          const fileStream = await fileUploadService.findDeliveryFile(attachment);
          bufferedUserImage = await stream2buffer(fileStream);
        }
        else if (user.imageUrlCached === '/images/icons/user.svg') {
          bufferedUserImage = await fsPromise.readFile(
            path.join(projectRoot, 'public/images/icons/user.svg'),
          );
        }
        else {
          throw new Error('imageUrlCached is invalid value');
        }

        pageTitle = (page.path).replace(/^(.)*\//, '');

      }
      catch (err) {
        logger.error(err);
        return res.status(400).send('the page does not exist');
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
        // const { status, statusText } = err.response;
        // console.log(`Error! HTTP Status: ${status} ${statusText}`);
        logger.error(err);
        return res.status(500).send();
      }

      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
      });
      result.data.pipe(res);
    },
  };
};
