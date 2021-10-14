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

type UnfurlEventLink = {
  url: string,
  domain: string,
}

type ResposeDataFromEachOrigin = {
  origin: string,
  data: DataForUnfurl[],
}

// aliases
type GrowiOrigin = string;
type Paths = string[];
type TokenPtoG = string;

export type UnfurlRequestEvent = {
  channel: string,

  // eslint-disable-next-line camelcase
  message_ts: string,

  links: UnfurlEventLink[],
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

export type DataForUnfurl = PrivateData | PublicData;

@Service()
export class UnfurlService implements GrowiEventProcessor {

  @Inject()
  relationRepository: RelationRepository;

  shouldHandleEvent(eventType: string): boolean {
    return eventType === 'link_shared';
  }

  async processEvent(client: WebClient, event: UnfurlRequestEvent): Promise<void> {
    const { links } = event;

    const origins: string[] = links.map((link: UnfurlEventLink) => (new URL(link.url)).origin);
    const originToTokenPtoGMap: Map<GrowiOrigin, TokenPtoG> = await this.generateOriginToTokenPtoGMapFromOrigins(origins); // get tokenPtoG at once

    const result = await this.forwardToEachGrowiOrigin(origins, event);
  }

  // generate Map<GrowiOrigin, TokenPtoG>
  async generateOriginToTokenPtoGMapFromOrigins(origins: GrowiOrigin[]): Promise<Map<GrowiOrigin, TokenPtoG>> {
    const originToTokenPtoGMap: Map<GrowiOrigin, TokenPtoG> = new Map();

    // get relations using origins at once
    const relations = await this.relationRepository.findAllByGrowiUris(origins);

    // increment map using relation.growiUri & relation.tokenPtoG
    relations.forEach((relation) => {
      originToTokenPtoGMap.set(relation.growiUri, relation.tokenPtoG);
    });

    return originToTokenPtoGMap;
  }

  async forwardToEachGrowiOrigin(
      origins: string[], event: UnfurlRequestEvent, originToTokenPtoGMap: Map<GrowiOrigin, TokenPtoG>,
  ): Promise<PromiseSettledResult<void>[]> {
    return Promise.allSettled(origins.map(async(origin) => {
      const requestBody = {
        growiBotEvent: {
          eventType: 'link_shared',
          event,
        },
        data: {
          origin,
        },
      };
      try {
        // ensure paths and tokenPtoG exist
        const tokenPtoG = originToTokenPtoGMap.get(origin);
        if (tokenPtoG == null) throw new Error('tokenPtoG is null');

        // get origin from growiTargetUrl and create url to use
        const url = new URL('/_api/v3/slack-integration/proxied/pages-unfurl', origin);

        const response = await axios.post(url.toString(),
          { event },
          {
            headers: {
              'x-growi-ptog-tokens': tokenPtoG,
            },
            timeout: REQUEST_TIMEOUT_FOR_PTOG,
          });

        // ensure data is not broken
        const data: DataForUnfurl[] = response.data?.data?.pageData;
        if (data == null) {
          throw Error('Malformed data found in axios response.');
        }
      }
      catch (err) {
        logger.error('Error occurred while request to growi:', err);
        throw new Error('Axios request to growi failed.');
      }
    }));
  }

  // Promise util method to output rejected results
  logErrorRejectedResults<T>(results: PromiseSettledResult<T>[]): void {
    const rejectedResults: PromiseRejectedResult[] = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');

    rejectedResults.forEach((rejected, i) => {
      logger.error(`Error occurred (count: ${i}): `, rejected.reason.toString());
    });
  }

}
