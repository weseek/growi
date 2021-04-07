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
        generateInputSectionBlock('growiDomain', 'GROWI domain', 'contents_input', true, 'https://example.com'),
        generateInputSectionBlock('growiAccessToken', 'GROWI ACCESS_TOKEN', 'contents_input', true, 'jBMZvpk0buKsZy9wSYJF6ZVefaedzh5Q883q+yoBrea='),
        generateInputSectionBlock('proxyToken', 'PROXY ACCESS_TOKEM', 'contents_input', true, 'IOKufkjs0buKsZy9wSYWE6ZVS5Jdzh5Q883q+yoB4F0='),

      ],
    },
  });
};
