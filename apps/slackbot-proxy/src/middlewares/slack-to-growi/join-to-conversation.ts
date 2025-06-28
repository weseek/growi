import { generateWebClient } from '@growi/slack/dist/utils/webclient-factory';
import { type IMiddleware, Middleware, Req } from '@tsed/common';
import type Logger from 'bunyan';

import type { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';
import loggerFactory from '~/utils/logger';

const logger: Logger = loggerFactory(
  'slackbot-proxy:middlewares:JoinToConversationsMiddleware',
);

/**
 * This middleware should be processed after AuthorizeCommandMiddleware or AuthorizeInteractionMiddleware
 */
@Middleware()
export class JoinToConversationMiddleware implements IMiddleware {
  async use(@Req() req: SlackOauthReq): Promise<void> {
    const { body, authorizeResult } = req;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const client = generateWebClient(authorizeResult.botToken!);

    try {
      await client.conversations.join({ channel: body.channel_id });
    } catch (err) {
      logger.error(err);
    }
  }
}
