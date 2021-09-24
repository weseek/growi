import loggerFactory from '~/utils/logger';

const {
  markdownSectionBlock, inputSectionBlock, respond, inputBlock,
} = require('@growi/slack');

const logger = loggerFactory('growi:service:SlackCommandHandler:create');

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

  handler.handleCommand = async(growiCommand, client, body) => {
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
          inputBlock(conversationsSelectElement, 'conversation', 'Channel name to display in the page to be created'),
          inputSectionBlock('path', 'Path', 'path_input', false, '/path'),
          inputSectionBlock('contents', 'Contents', 'contents_input', true, 'Input with Markdown...'),
        ],
        private_metadata: JSON.stringify({ channelId: body.channel_id, channelName: body.channel_name }),
      },
    });
  };

  handler.handleInteractions = async function(client, interactionPayload, interactionPayloadAccessor, handlerMethodName) {
    await this[handlerMethodName](client, interactionPayload, interactionPayloadAccessor);
  };

  handler.createPage = async function(client, interactionPayload, interactionPayloadAccessor) {
    const path = interactionPayloadAccessor.getStateValues()?.path.path_input.value;
    const privateMetadata = interactionPayloadAccessor.getViewPrivateMetaData();
    if (privateMetadata == null) {
      await respond(interactionPayloadAccessor.getResponseUrl(), {
        text: 'Error occurred',
        blocks: [
          markdownSectionBlock('Failed to create a page.'),
        ],
      });
      return;
    }
    const contentsBody = interactionPayloadAccessor.getStateValues()?.contents.contents_input.value;
    await createPageService.createPageInGrowi(interactionPayloadAccessor, path, contentsBody);
  };

  return handler;
};
