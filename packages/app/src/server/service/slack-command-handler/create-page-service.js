import loggerFactory from '~/utils/logger';
import {
  respondFromGrowi,
} from './response-url';

const logger = loggerFactory('growi:service:CreatePageService');
const { reshapeContentsBody, respond, markdownSectionBlock } = require('@growi/slack');
const mongoose = require('mongoose');
const pathUtils = require('growi-commons').pathUtils;
const SlackbotError = require('../../models/vo/slackbot-error');

class CreatePageService {

  constructor(crowi, proxyUri, tokenGtoP) {
    this.crowi = crowi;
    this.proxyUri = proxyUri;
    this.tokenGtoP = tokenGtoP;
  }

  async createPageInGrowi(interactionPayloadAccessor, path, contentsBody) {
    const Page = this.crowi.model('Page');
    const reshapedContentsBody = reshapeContentsBody(contentsBody);
    try {
      // sanitize path
      const sanitizedPath = this.crowi.xss.process(path);
      const normalizedPath = pathUtils.normalizePath(sanitizedPath);

      // generate a dummy id because Operation to create a page needs ObjectId
      const dummyObjectIdOfUser = new mongoose.Types.ObjectId();
      const page = await Page.create(normalizedPath, reshapedContentsBody, dummyObjectIdOfUser, {});

      // Send a message when page creation is complete
      const growiUri = this.crowi.appService.getSiteUrl();
      return respondFromGrowi(interactionPayloadAccessor.getResponseUrl(), this.proxyUri, this.tokenGtoP, {
        text: 'Page has been created',
        blocks: [
          markdownSectionBlock(`The page <${decodeURI(`${growiUri}/${page._id} | ${decodeURI(growiUri + normalizedPath)}`)}> has been created.`),
        ],
      });
    }
    catch (err) {
      logger.error('Failed to create page in GROWI.', err);
      throw new SlackbotError({
        method: 'postMessage',
        to: 'dm',
        popupMessage: 'Cannot create new page to existed path.',
        mainMessage: `Cannot create new page to existed path\n *Contents* :memo:\n ${reshapedContentsBody}`,
      });
    }
  }

}

module.exports = CreatePageService;
