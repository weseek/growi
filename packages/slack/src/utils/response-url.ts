import axios from 'axios';

import { RespondBodyForResponseUrl } from '../interfaces/response-url';

export type AxiosOptions = {
  headers?: {
    [header:string]: string,
  }
}

export async function respond(responseUrl: string, body: RespondBodyForResponseUrl, options?: AxiosOptions): Promise<void> {
  return axios.post(responseUrl, {
    replace_original: false,
    text: body.text,
    blocks: body.blocks,
  }, options);
}

export async function respondInChannel(responseUrl: string, body: RespondBodyForResponseUrl, options?: AxiosOptions): Promise<void> {
  return axios.post(responseUrl, {
    response_type: 'in_channel',
    replace_original: false,
    text: body.text,
    blocks: body.blocks,
  }, options);
}

export async function replaceOriginal(responseUrl: string, body: RespondBodyForResponseUrl, options?: AxiosOptions): Promise<void> {
  return axios.post(responseUrl, {
    replace_original: true,
    text: body.text,
    blocks: body.blocks,
  }, options);
}

export async function deleteOriginal(responseUrl: string, options?: AxiosOptions): Promise<void> {
  return axios.post(responseUrl, {
    delete_original: true,
  }, options);
}
