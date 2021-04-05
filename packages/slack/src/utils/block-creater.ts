export const generateMarkdownSectionBlock = (blocks) => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: blocks,
    },
  };
};

export const generateInputSectionBlock = (blockId, labelText, actionId, isMultiline, placeholder) => {
  return {
    type: 'input',
    block_id: blockId,
    label: {
      type: 'plain_text',
      text: labelText,
    },
    element: {
      type: 'plain_text_input',
      action_id: actionId,
      multiline: isMultiline,
      placeholder: {
        type: 'plain_text',
        text: placeholder,
      },
    },
  };
};
