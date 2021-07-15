const { BlockKitBuilder: B } = require('@growi/slack');

module.exports = () => {
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler();

  handler.handleCommand = async function(client, body, args, limit = 10) {
    // TODO GW-6721 Get the time from args
    const reusult = await client.conversations.history({
      channel: body.channel_id,
      limit,
    });
    console.log(reusult);
    // Checkbox Message を返す
    client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'Select messages to use.',
      blocks: this.togetterMessageBlocks(),
    });
    return;
  };

  handler.togetterMessageBlocks = function() {
    return [
      B.inputBlock(this.togetterCheckboxesElement(), 'selected_messages', 'Select massages to use.'),
      B.actionsBlock(B.buttonElement('Show more', 'togetterShowMore')),
      B.inputBlock(this.togetterInputBlockElement('page_path', '/'), 'page_path', 'Page path'),
      B.actionsBlock(B.buttonElement('Cancel', 'togetterCancelPageCreation'), B.buttonElement('Create page', 'togetterCreatePage', 'primary')),
    ];
  };

  handler.togetterCheckboxesElement = function() {
    return {
      type: 'checkboxes',
      options: this.togetterCheckboxesElementOptions(),
      action_id: 'checkboxes_changed',
    };
  };

  handler.togetterCheckboxesElementOptions = function() {
    // options を conversations.history の結果でインクリメント
    const options = [];
    // 仮置き
    for (let i = 0; i < 10; i++) {
      const option = B.checkboxesElementOption('*username*  12:00PM', 'sample slack messages ... :star:', `selected-${i}`);
      options.push(option);
    }
    return options;
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

  return handler;
};
