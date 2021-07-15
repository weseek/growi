import {
  SectionBlock, InputBlock, DividerBlock, ActionsBlock,
  Button, Overflow, Datepicker, Select, RadioButtons, Checkboxes, Action, MultiSelect, PlainTextInput, Option,
} from '@slack/types';

export class BlockKitBuilder {

  static divider(): DividerBlock {
    return {
      type: 'divider',
    };
  }

  static markdownSectionBlock(text: string): SectionBlock {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
      },
    };
  }

  static inputSectionBlock(blockId: string, labelText: string, actionId: string, isMultiline: boolean, placeholder: string): InputBlock {
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

  static actionsBlock(...elements: (Button | Overflow | Datepicker | Select | RadioButtons | Checkboxes | Action)[]): ActionsBlock {
    return {
      type: 'actions',
      elements: [
        ...elements,
      ],
    };
  }

  static inputBlock(element: Select | MultiSelect | Datepicker | PlainTextInput | RadioButtons | Checkboxes, blockId: string, labelText: string): InputBlock {
    return {
      type: 'input',
      block_id: blockId,
      element,
      label: {
        type: 'plain_text',
        text: labelText,
      },
    };
  }

  /**
   * Button element
   * https://api.slack.com/reference/block-kit/block-elements#button
   */
  static buttonElement(text: string, actionId: string, style?: string): Button {
    const button: Button = {
      type: 'button',
      text: {
        type: 'plain_text',
        text,
      },
      action_id: actionId,
    };
    if (style === 'primary' || style === 'danger') {
      button.style = style;
    }
    return button;
  }

  /**
   * Option object
   * https://api.slack.com/reference/block-kit/composition-objects#option
   */
  static checkboxesElementOption(text: string, description: string, value: string): Option {
    return {
      text: {
        type: 'mrkdwn',
        text,
      },
      description: {
        type: 'plain_text',
        text: description,
      },
      value,
    };
  }

}
