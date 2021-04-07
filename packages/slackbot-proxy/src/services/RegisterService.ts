import { WebClient, LogLevel } from '@slack/web-api';
import { generateInputSectionBlock, generateMarkdownSectionBlock } from '@growi/slack/src/utils/block-creater';

export const openRegisterModal = async(body:{[key:string]:string}) : Promise<void> => {

  const client = new WebClient('', { logLevel: LogLevel.DEBUG });
  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Register Credentials',
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
      },
      close: {
        type: 'plain_text',
        text: 'Close',
      },
      blocks: [
        generateMarkdownSectionBlock('hoge'),
        generateInputSectionBlock('contents', 'Contents', 'contents_input', true, 'Input with Markdown...'),

      ],
    },
  });
};
