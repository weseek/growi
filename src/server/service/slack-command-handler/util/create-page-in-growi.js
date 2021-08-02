const { markdownSectionBlock } = require('@growi/slack');
const logger = require('@alias/logger')('growi:util:createPageInGrowi');
const { reshapeContentsBody } = require('@growi/slack');
const mongoose = require('mongoose');
const pathUtils = require('growi-commons').pathUtils;

module.exports = crowi => async(client, payload, path, channelId, contentsBody) => {
  const Page = crowi.model('Page');
  const reshapedContentsBody = reshapeContentsBody(contentsBody);
  try {
    // sanitize path
    const sanitizedPath = crowi.xss.process(path);
    const normalizedPath = pathUtils.normalizePath(sanitizedPath);

    // generate a dummy id because Operation to create a page needs ObjectId
    const dummyObjectIdOfUser = new mongoose.Types.ObjectId();
    const page = await Page.create(normalizedPath, reshapedContentsBody, dummyObjectIdOfUser, {});

    // Send a message when page creation is complete
    const growiUri = crowi.appService.getSiteUrl();
    await client.chat.postEphemeral({
      channel: channelId,
      user: payload.user.id,
      text: `The page <${decodeURI(`${growiUri}/${page._id} | ${decodeURI(growiUri + normalizedPath)}`)}> has been created.`,
    });
  }
  catch (err) {
    client.chat.postMessage({
      channel: payload.user.id,
      blocks: [
        markdownSectionBlock(`Cannot create new page to existed path\n *Contents* :memo:\n ${reshapedContentsBody}`)],
    });
    logger.error('Failed to create page in GROWI.');
    throw err;
  }
};
