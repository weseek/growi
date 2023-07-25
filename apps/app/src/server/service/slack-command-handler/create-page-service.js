import { markdownSectionBlock } from '@growi/slack/dist/utils/block-kit-builder';
import { reshapeContentsBody } from '@growi/slack/dist/utils/reshape-contents-body';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:CreatePageService');
const { pathUtils } = require('@growi/core/dist/utils');
const mongoose = require('mongoose');

class CreatePageService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  async createPageInGrowi(interactionPayloadAccessor, path, contentsBody, respondUtil, user) {
    const reshapedContentsBody = reshapeContentsBody(contentsBody);

    // sanitize path
    const sanitizedPath = this.crowi.xss.process(path);
    const normalizedPath = pathUtils.normalizePath(sanitizedPath);

    // Since an ObjectId is required for creating a page, if a user does not exist, a dummy user will be generated
    const userOrDummyUser = user != null ? user : { _id: new mongoose.Types.ObjectId() };

    const page = await this.crowi.pageService.create(normalizedPath, reshapedContentsBody, userOrDummyUser, {});

    // Send a message when page creation is complete
    const growiUri = this.crowi.appService.getSiteUrl();
    await respondUtil.respond({
      text: 'Page has been created',
      blocks: [
        markdownSectionBlock(`The page <${decodeURI(`${growiUri}/${page._id} | ${decodeURI(growiUri + normalizedPath)}`)}> has been created.`),
      ],
    });
  }

}

module.exports = CreatePageService;
