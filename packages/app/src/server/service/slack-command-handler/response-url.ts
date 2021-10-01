import {
  RespondBodyForResponseUrl, respond, respondInChannel, replaceOriginal, deleteOriginal, AxiosOptions,
} from '@growi/slack';

import urljoin from 'url-join';

type UrlAndOptions = {
  url: string,
  options: AxiosOptions,
}

function getResponseUrlForProxy(proxyUri: string, responseUrl: string): string {
  return urljoin(proxyUri, `/g2s/respond?response_url=${responseUrl}`);
}

function getUrlAndHeaders(responseUrl: string, proxyUri: string | null, tokenGtoP: string | null): UrlAndOptions {
  let url: string;
  let options: AxiosOptions = {};

  if (proxyUri == null) {
    url = responseUrl;
  }
  else {
    if (tokenGtoP == null) throw Error('Error occurred while generating headers: tokenGtoP must exist.');

    url = getResponseUrlForProxy(proxyUri, responseUrl);
    options = {
      headers: {
        'x-growi-gtop-tokens': tokenGtoP,
      },
    };
  }

  return { url, options };
}

export async function respondFromGrowi(responseUrl: string, proxyUri: string | null, tokenGtoP: string | null, body: RespondBodyForResponseUrl): Promise<void> {
  const { url, options } = getUrlAndHeaders(responseUrl, proxyUri, tokenGtoP);
  return respond(url, body, options);
}

export async function respondInChannelFromGrowi(
    responseUrl: string, proxyUri: string | null, tokenGtoP: string | null, body: RespondBodyForResponseUrl,
): Promise<void> {
  const { url, options } = getUrlAndHeaders(responseUrl, proxyUri, tokenGtoP);
  return respondInChannel(url, body, options);
}

export async function replaceOriginalFromGrowi(
    responseUrl: string, proxyUri: string | null, tokenGtoP: string | null, body: RespondBodyForResponseUrl,
): Promise<void> {
  const { url, options } = getUrlAndHeaders(responseUrl, proxyUri, tokenGtoP);
  return replaceOriginal(url, body, options);
}

export async function deleteOriginalFromGrowi(responseUrl: string, proxyUri: string | null, tokenGtoP: string | null): Promise<void> {
  const { url, options } = getUrlAndHeaders(responseUrl, proxyUri, tokenGtoP);
  return deleteOriginal(url, options);
}
