const {
  inputBlock, actionsBlock, buttonElement, markdownSectionBlock,
} = require('@growi/slack');
const { format } = require('date-fns');

module.exports = (crowi) => {
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler();

  handler.handleCommand = async function(client, body, args, limit = 10) {
    // TODO GW-6721 Get the time from args
    const result = await client.conversations.history({
      channel: body.channel_id,
      limit,
    });
      // Return Checkbox Message
    client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'Select messages to use.',
      blocks: this.togetterMessageBlocks(result.messages, body, args, limit),
    });
    return;
  };

  handler.togetterMessageBlocks = function(messages, body, args, limit) {
    return [
      markdownSectionBlock('Select the oldest and latest datetime of the messages to use.'),
      inputBlock(this.plainTextInputElementWithInitialTime('oldest'), 'oldest', 'Oldest datetime'),
      inputBlock(this.plainTextInputElementWithInitialTime('latest'), 'latest', 'Latest datetime'),
      inputBlock(this.togetterInputBlockElement('page_path', '/'), 'page_path', 'Page path'),
      actionsBlock(
        buttonElement({ text: 'Cancel', actionId: 'togetter:cancel' }),
        buttonElement({ text: 'Create page', actionId: 'togetter:createPage', style: 'primary' }),
      ),
    ];
  };

  /**
   * Plain-text input element
   * https://api.slack.com/reference/block-kit/block-elements#input
   */
  handler.togetterInputBlockElement = function(actionId, placeholderText = 'Write something ...') {
    return {
      type: 'plain_text_input',
      placeholder: {
        type: 'plain_text',
        text: placeholderText,
      },
      action_id: actionId,
    };
  };

  handler.plainTextInputElementWithInitialTime = function(actionId) {
    const tzDateSec = new Date().getTime();
    const grwTzoffset = crowi.appService.getTzoffset() * 60 * 1000;
    const initialDateTime = format(new Date(tzDateSec - grwTzoffset), 'yyyy/MM/dd-HH:mm');
    return {
      type: 'plain_text_input',
      action_id: actionId,
      initial_value: initialDateTime,
    };
  };

  return handler;
};
