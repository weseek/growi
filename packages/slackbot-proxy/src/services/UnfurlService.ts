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

type ResposeDataFromEachOrigin = {
  origin: string,
  data: UnfurlPageResponseData[],
}

// aliases
type GrowiOrigin = string;
type Paths = string[];
type TokenPtoG = string;

export type UnfurlRequestEvent = {
  channel: string,

  // eslint-disable-next-line camelcase
  message_ts: string,

  links: UnfurlEventLinks[],
}

type PrivateData = {
  isPublic: false,
  path: string,
}

type PublicData = {
  isPublic: true,
  path: string,
  pageBody: string,
  updatedAt: string,
  commentCount: number,
}

export type UnfurlPageResponseData = PrivateData | PublicData;

@Service()
export class UnfurlService implements GrowiEventProcessor {

  @Inject()
  relationRepository: RelationRepository;

  shouldHandleEvent(eventType: string): boolean {
    return eventType === 'link_shared';
  }

  async processEvent(client: WebClient, event: UnfurlRequestEvent): Promise<void> {
    const { channel, message_ts: ts, links } = event;

    // generate originToPathsMap
    const originToPathsMap = this.generateOriginToPathsMapFromLinks(links);

    const origins = Array.from(originToPathsMap.keys());

    // get tokenPtoG at once
    const originToTokenPtoGMap = await this.generateOriginToTokenPtoGMapFromOrigins(origins);

    // get pages from each growi
    const pagesResults = await Promise.allSettled(origins.map(async(origin): Promise<ResposeDataFromEachOrigin> => {
      try {
        const paths = originToPathsMap.get(origin);
        const tokenPtoG = originToTokenPtoGMap.get(origin);
        // ensure paths and tokenPtoG exist
        if (paths == null) throw new Error('paths is null');
        else if (tokenPtoG == null) throw new Error('tokenPtoG is null');

        // get origin from growiTargetUrl and create url to use
        const url = new URL('/_api/v3/slack-integration/proxied/pages-unfurl', origin);

        const response = await axios.post(url.toString(),
          { paths },
          {
            headers: {
              'x-growi-ptog-tokens': tokenPtoG,
            },
            timeout: REQUEST_TIMEOUT_FOR_PTOG,
          });

        // ensure data is not broken
        const data: UnfurlPageResponseData[] = response.data?.data?.pageData;
        if (data == null) {
          throw Error('Malformed data found in axios response.');
        }

        return { origin, data };
      }
      catch (err) {
        logger.error('Error occurred while request to growi:', err);
        throw new Error('Axios request to growi failed.');
      }
    }));

    // log and extract
    this.logErrorRejectedResults(pagesResults);
    const fulfilledPagesResults = this.extractFulfilledResults(pagesResults);

    // unfurl each target url
    await Promise.all(fulfilledPagesResults.map(async(result) => {
      const { value } = result;
      const { origin, data } = value;

      const unfurlResults = await Promise.allSettled(data.map(async(datum) => {
        const targetUrl = `${origin}${datum.path}`;
        // return early when page is private
        if (datum.isPublic === false) {
          await client.chat.unfurl({
            channel,
            ts,
            unfurls: {
              [targetUrl]: {
                text: 'Page is not public.',
              },
            },
          });
          return;
        }

        // build unfurl arguments
        const unfurls = this.generateLinkUnfurls(datum as PublicData, targetUrl);
        const unfurlArgs: ChatUnfurlArguments = {
          channel,
          ts,
          unfurls,
        };
        await client.chat.unfurl(unfurlArgs);
      }));

      // log errors
      this.logErrorRejectedResults(unfurlResults);
    }));

  }

  generateLinkUnfurls(body: PublicData, growiTargetUrl: string): LinkUnfurls {
    const { pageBody: text, updatedAt, commentCount } = body;

    const updatedAtFormatted = format(parseISO(updatedAt), 'yyyy-MM-dd HH:mm');
    const footer = `updated at: ${updatedAtFormatted}  comments: ${commentCount}`;

    const attachment: MessageAttachment = {
      text,
      footer,
      // TODO: consider whether to keep these buttons
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

  generateOriginToPathsMapFromLinks(links: UnfurlEventLinks[]): Map<GrowiOrigin, Paths> {
    // paths map for each growi origin
    const originToPathsMap: Map<GrowiOrigin, Paths> = new Map();

    // increment
    links.forEach((link) => {
      const { url: growiTargetUrl } = link;
      const urlObject = new URL(growiTargetUrl);
      const { origin } = urlObject;

      if (!originToPathsMap.has(origin)) {
        originToPathsMap.set(origin, []);
      }
      // append path
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      originToPathsMap.set(origin, [...originToPathsMap.get(origin)!, urlObject.pathname]);
    });

    return originToPathsMap;
  }

  async generateOriginToTokenPtoGMapFromOrigins(origins: GrowiOrigin[]): Promise<Map<GrowiOrigin, TokenPtoG>> {
    const originToTokenPtoGMap: Map<GrowiOrigin, TokenPtoG> = new Map();

    // bulk get relations using origins
    const relations = await this.relationRepository.findAllByGrowiUris(origins);

    // increment map using relation.growiUri & relation.tokenPtoG
    relations.forEach((relation) => {
      originToTokenPtoGMap.set(relation.growiUri, relation.tokenPtoG);
    });

    return originToTokenPtoGMap;
  }

  extractFulfilledResults<T>(results: PromiseSettledResult<T>[]): PromiseFulfilledResult<T>[] {
    const fulfilledResults: PromiseFulfilledResult<T>[] = results.filter((result): result is PromiseFulfilledResult<T> => result.status === 'fulfilled');

    return fulfilledResults;
  }

  logErrorRejectedResults<T>(results: PromiseSettledResult<T>[]): void {
    const rejectedResults: PromiseRejectedResult[] = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');

    rejectedResults.forEach((rejected, i) => {
      logger.error(`Error occurred (count: ${i}): `, rejected.reason.toString());
    });
  }

}
