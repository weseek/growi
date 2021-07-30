const { markdownSectionBlock, inputSectionBlock } = require('@growi/slack');
const logger = require('@alias/logger')('growi:service:SlackCommandHandler:create');
const { reshapeContentsBody } = require('@growi/slack');
const mongoose = require('mongoose');

module.exports = (crowi) => {
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler();

  handler.handleCommand = async(client, body) => {
    try {
      await client.views.open({
        trigger_id: body.trigger_id,

        view: {
          type: 'modal',
          callback_id: 'create:createPage',
          title: {
            type: 'plain_text',
            text: 'Create Page',
          },
          submit: {
            type: 'plain_text',
            text: 'Submit',
          },
          close: {
            type: 'plain_text',
            text: 'Cancel',
          },
          blocks: [
            markdownSectionBlock('Create new page.'),
            inputSectionBlock('path', 'Path', 'path_input', false, '/path'),
            inputSectionBlock('contents', 'Contents', 'contents_input', true, 'Input with Markdown...'),
          ],
          private_metadata: JSON.stringify({ channelId: body.channel_id }),
        },
      });
    }
    catch (err) {
      logger.error('Failed to create a page.');
      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: 'Failed To Create',
        blocks: [
          markdownSectionBlock(`*Failed to create new page.*\n ${err}`),
        ],
      });
      throw err;
    }
  };

  handler.handleBlockActions = async function(client, payload, handlerMethodName) {
    await this[handlerMethodName](client, payload);
  };

  handler.createPage = async function(client, payload) {
    const path = payload.view.state.values.path.path_input.value;
    const channelId = JSON.parse(payload.view.private_metadata).channelId;
    const contentsBody = payload.view.state.values.contents.contents_input.value;
    await this.MUSTMOVETOUTILcreatePage(client, payload, path, channelId, contentsBody);
  };

  handler.MUSTMOVETOUTILcreatePage = async function(client, payload, path, channelId, contentsBody) {
    const Page = crowi.model('Page');
    const pathUtils = require('growi-commons').pathUtils;
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

  return handler;
};
