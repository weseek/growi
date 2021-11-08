import { WebAPICallResult } from '@slack/web-api';
import { respond } from './response-url';

import { markdownSectionBlock } from './block-kit-builder';

export const respondRejectedErrors = async(
    rejectedResults: PromiseRejectedResult[],
    responseUrl: string,
): Promise<WebAPICallResult|void> => {

  if (rejectedResults.length > 0) {
    await respond(responseUrl, {
      text: 'Error occured.',
      blocks: [
        markdownSectionBlock('*Error occured:*'),
        ...rejectedResults.map((rejectedResult) => {
          const reason = rejectedResult.reason.toString();
          const resData = rejectedResult.reason.response?.data;
          const resDataMessage = resData?.message || resData?.toString();

          let errorMessage = reason;
          if (resDataMessage != null) {
            errorMessage += `\n  Cause: ${resDataMessage}`;
          }

          return markdownSectionBlock(errorMessage);
        }),
      ],
    });
  }

  return;
};
