import axios from 'axios';
import { Inject, Service } from '@tsed/di';
import { GrowiEventProcessor, REQUEST_TIMEOUT_FOR_PTOG } from '@growi/slack';
import {
  ChatUnfurlArguments, LinkUnfurls, MessageAttachment, WebClient,
} from '@slack/web-api';
import { format, parseISO } from 'date-fns';
import loggerFactory from '~/utils/logger';
import { RelationRepository } from '~/repositories/relation';

const logger = loggerFactory('slackbot-proxy:services:UnfurlService');

type UnfurlEventLinks = {
  url: string,
  domain: string,
}

export type UnfurlRequestEvent = {
  channel: string,

  // eslint-disable-next-line camelcase
  message_ts: string,

  links: UnfurlEventLinks[],
}

export type UnfurlPageResponseData = {
  isPrivate: boolean,
  pageBody: string,
  updatedAt: string,
  commentCount: number,
}

@Service()
export class UnfurlService implements GrowiEventProcessor {

  @Inject()
  relationRepository: RelationRepository;

  shouldHandleEvent(eventType: string): boolean {
    return eventType === 'link_shared';
  }

  async processEvent(client: WebClient, event: UnfurlRequestEvent): Promise<void> {
    const { channel, message_ts: ts, links } = event;

    const results = await Promise.allSettled(links.map(async(link) => {
      const { url: growiTargetUrl } = link;

      const urlObject = new URL(growiTargetUrl);

      const tokenPtoG = await this.getTokenPtoGFromUrlObject(urlObject);

      let result;
      try {
        // get origin from growiTargetUrl and create url to use
        const growiTargetUrlObject = new URL(growiTargetUrl);
        const url = new URL('/_api/v3/slack-integration/proxied/page-unfurl', growiTargetUrlObject.origin);

        result = await axios.post(url.toString(),
          { path: growiTargetUrlObject.pathname },
          {
            headers: {
              'x-growi-ptog-tokens': tokenPtoG,
            },
            timeout: REQUEST_TIMEOUT_FOR_PTOG,
          });
      }
      catch (err) {
        return logger.error(err);
      }

      const data = result.data?.data;
      if (data == null) {
        return logger.error('Malformed data found in axios response.');
      }

      // return early when page is private
      if (data.isPrivate) {
        return client.chat.unfurl({
          channel,
          ts,
          unfurls: {
            [growiTargetUrl]: {
              text: 'Page is not public.',
            },
          },
        });
      }

      // build unfurl arguments
      const unfurls = this.getLinkUnfurls(data as UnfurlPageResponseData, growiTargetUrl);
      const unfurlArgs: ChatUnfurlArguments = {
        channel,
        ts,
        unfurls,
      };

      await client.chat.unfurl(unfurlArgs);
    }));

    const rejectedResults: PromiseRejectedResult[] = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');

    if (rejectedResults.length > 0) {
      rejectedResults.forEach((rejected, i) => {
        logger.error(`Error occurred while unfurling (count: ${i}): `, rejected.reason.toString());
      });
    }
  }

  getLinkUnfurls(body: UnfurlPageResponseData, growiTargetUrl: string): LinkUnfurls {
    const { pageBody: text, updatedAt, commentCount } = body;

    const updatedAtFormatted = format(parseISO(updatedAt), 'yyyy-MM-dd HH:mm');
    const footer = `updated at: ${updatedAtFormatted}  comments: ${commentCount}`;

    const attachment: MessageAttachment = {
      text,
      footer,
      actions: [
        {
          type: 'button',
          text: 'View',
          url: growiTargetUrl,
        },
        {
          type: 'button',
          text: 'Edit',
          url: `${growiTargetUrl}#edit`,
        },
      ],
    };

    const unfurls: LinkUnfurls = {
      [growiTargetUrl]: attachment,
    };

    return unfurls;
  }

  async getTokenPtoGFromUrlObject(urlObject: URL): Promise<string> {
    let relation;
    try {
      relation = await this.relationRepository.findOneByGrowiUri(urlObject.origin);
    }
    catch (err) {
      return logger.error('Error occurred while finding relation by growi uri:', err);
    }

    let tokenPtoG;
    if (relation != null) {
      tokenPtoG = relation.tokenPtoG;
    }
    else {
      return logger.error('Relation not found');
    }

    return tokenPtoG;
  }

}
