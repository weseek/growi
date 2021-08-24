import loggerFactory from '~/utils/logger';

const { markdownSectionBlock, inputSectionBlock } = require('@growi/slack');

const logger = loggerFactory('growi:service:SlackCommandHandler:create');

module.exports = (crowi) => {
  const CreatePageService = require('./create-page-service');
  const createPageService = new CreatePageService(crowi);
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler();

  handler.handleCommand = async(client, body) => {
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
  };

  handler.handleBlockActions = async function(client, payload, handlerMethodName) {
    await this[handlerMethodName](client, payload);
  };

  handler.createPage = async function(client, payload) {
    const path = payload.view.state.values.path.path_input.value;
    const channelId = JSON.parse(payload.view.private_metadata).channelId;
    const contentsBody = payload.view.state.values.contents.contents_input.value;
    await createPageService.createPageInGrowi(client, payload, path, channelId, contentsBody);
  };

  return handler;
};
