import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:CreatePageService');
const { reshapeContentsBody, respond, markdownSectionBlock } = require('@growi/slack');
const mongoose = require('mongoose');
const { pathUtils } = require('@growi/core');

class CreatePageService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  async createPageInGrowi(interactionPayloadAccessor, path, contentsBody, respondUtil, userId) {
    const Page = this.crowi.model('Page');
    const reshapedContentsBody = reshapeContentsBody(contentsBody);

    // sanitize path
    const sanitizedPath = this.crowi.xss.process(path);
    const normalizedPath = pathUtils.normalizePath(sanitizedPath);

    // generate a dummy id because Operation to create a page needs ObjectId
    const dummyObjectIdOfUser = userId != null ? userId : new mongoose.Types.ObjectId();
    const page = await this.crowi.pageService.create(normalizedPath, reshapedContentsBody, dummyObjectIdOfUser, {});

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
