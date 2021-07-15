import { WebAPICallResult } from '@slack/web-api';

import { BlockKitBuilder as B } from './block-kit-builder';
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
        B.markdownSectionBlock('*Error occured:*'),
        ...rejectedResults.map((rejectedResult) => {
          const reason = rejectedResult.reason.toString();
          const resData = rejectedResult.reason.response?.data;
          const resDataMessage = resData?.message || resData?.toString();

          let errorMessage = reason;
          if (resDataMessage != null) {
            errorMessage += `\n  Cause: ${resDataMessage}`;
          }

          return B.markdownSectionBlock(errorMessage);
        }),
      ],
    });
  }

  return;
};
