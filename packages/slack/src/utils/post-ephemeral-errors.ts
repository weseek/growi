import { WebAPICallResult } from '@slack/web-api';

import { generateMarkdownSectionBlock } from './block-creater';
import { generateWebClient } from './webclient-factory';

export const postEphemeralErrors = async(
  rejectedResults: PromiseRejectedResult[],
  channelId: string,
  userId: string,
  botToken: string,
): Promise<WebAPICallResult|void> => {

  if (rejectedResults.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const client = generateWebClient(botToken);

    return client.chat.postEphemeral({
      text: 'Error occured.',
      channel: channelId,
      user: userId,
      blocks: [
        generateMarkdownSectionBlock('*Error occured:*'),
        ...rejectedResults.map((rejectedResult) => {
          const reason = rejectedResult.reason.toString();
          const resData = rejectedResult.reason.response?.data;
          const resDataMessage = resData?.message || resData.toString();
          const errorMessage = `${reason} (${resDataMessage})`;
          return generateMarkdownSectionBlock(errorMessage);
        }),
      ],
    });
  }

  return;
};
