import { SectionBlock, InputBlock, DividerBlock } from '@slack/types';

export class BlockKitBuilder {

  static generateMarkdownSectionBlock(text: string): SectionBlock {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
      },
    };
  }

  static divider(): DividerBlock {
    return {
      type: 'divider',
    };
  }

  static generateInputSectionBlock(blockId: string, labelText: string, actionId: string, isMultiline: boolean, placeholder: string): InputBlock {
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
  }

}
