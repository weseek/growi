import axios, { AxiosResponse } from 'axios';
import { Service } from '@tsed/di';
import { GrowiEventProcessor } from '@growi/slack';
import {
  ChatUnfurlArguments, LinkUnfurls, MessageAttachment, WebClient,
} from '@slack/web-api';
import { format, parseISO } from 'date-fns';
import loggerFactory from '~/utils/logger';

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

@Service()
export class UnfurlService implements GrowiEventProcessor {

  shouldHandleEvent(eventType: string): boolean {
    return eventType === 'link_shared';
  }

  async processEvent(client: WebClient, event: UnfurlRequestEvent): Promise<void> {
    const { channel, message_ts: ts, links } = event;

    const results = await Promise.allSettled(links.map(async(link) => {
      const { url: growiTargetUrl } = link;

      // TODO: request to growi to fetch page data 78968
      const resultOfAxiosRequestToGrowi = {
        // eslint-disable-next-line max-len
        body: '## Loooooooong markdown text\n## Loooooooong markdown text\n## Loooooooong markdown text\n## Loooooooong markdown text\n## Loooooooong markdown text\n## Loooooooong markdown text\n## Loooooooong markdown text\n',
        comments: 10,
        updatedAt: (new Date()).toISOString(),
      };

      // build unfurl arguments
      const unfurls = this.getLinkUnfurls(resultOfAxiosRequestToGrowi, growiTargetUrl);
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

  getLinkUnfurls(response: AxiosResponse | any /* TODO: delete any 78968 */, growiTargetUrl: string): LinkUnfurls {
    const text = response.body;
    const updatedAt = format(parseISO(response.updatedAt), 'yyyy-MM-dd HH:mm');
    const footer = `updated at: ${updatedAt}  comments: ${response.comments}`;

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

}
