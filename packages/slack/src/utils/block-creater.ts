import { SectionBlock, InputBlock } from '@slack/types';

export const generateMarkdownSectionBlock = (blocks:string):SectionBlock => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: blocks,
    },
  };
};

export const generateInputSectionBlock = (blockId:string, labelText:string, actionId:string, isMultiline:boolean, placeholder:string):InputBlock => {
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
