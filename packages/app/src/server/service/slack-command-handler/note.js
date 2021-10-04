import loggerFactory from '~/utils/logger';

const {
  markdownSectionBlock, inputSectionBlock, inputBlock,
} = require('@growi/slack');

const logger = loggerFactory('growi:service:SlackCommandHandler:note');

module.exports = (crowi) => {
  const CreatePageService = require('./create-page-service');
  const createPageService = new CreatePageService(crowi);
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler();
  const conversationsSelectElement = {
    action_id: 'conversation',
    type: 'conversations_select',
    response_url_enabled: true,
    default_to_current_conversation: true,
  };

  handler.handleCommand = async(growiCommand, client, body, respondUtil) => {
    await client.views.open({
      trigger_id: body.trigger_id,

      view: {
        type: 'modal',
        callback_id: 'note:createPage',
        title: {
          type: 'plain_text',
          text: 'Take a note',
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
          markdownSectionBlock('Take a note on GROWI'),
          inputBlock(conversationsSelectElement, 'conversation', 'Channel name to display in the page to be created'),
          inputSectionBlock('path', 'Page path', 'path_input', false, '/path'),
          inputSectionBlock('contents', 'Contents', 'contents_input', true, 'Input with Markdown...'),
        ],
        private_metadata: JSON.stringify({ channelId: body.channel_id, channelName: body.channel_name }),
      },
    });
  };

  handler.handleInteractions = async function(client, interactionPayload, interactionPayloadAccessor, handlerMethodName, respondUtil) {
    await this[handlerMethodName](client, interactionPayload, interactionPayloadAccessor, respondUtil);
  };

  handler.createPage = async function(client, interactionPayload, interactionPayloadAccessor, respondUtil) {
    const path = interactionPayloadAccessor.getStateValues()?.path.path_input.value;
    const privateMetadata = interactionPayloadAccessor.getViewPrivateMetaData();
    if (privateMetadata == null) {
      await respondUtil.respond({
        text: 'Error occurred',
        blocks: [
          markdownSectionBlock('Failed to create a page.'),
        ],
      });
      return;
    }
    const contentsBody = interactionPayloadAccessor.getStateValues()?.contents.contents_input.value;
    await createPageService.createPageInGrowi(interactionPayloadAccessor, path, contentsBody, respondUtil);
  };

  return handler;
};
