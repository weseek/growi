// eslint-disable-next-line no-restricted-imports
import { AxiosResponse } from 'axios';
import urljoin from 'url-join';

// eslint-disable-next-line no-restricted-imports

import { toArrayIfNot } from '~/utils/array-utils';
import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';

const apiv3Root = '/_api/v3';

const logger = loggerFactory('growi:apiv3');


const apiv3ErrorHandler = (_err: any): any[] => {
  // extract api errors from general 400 err
  const err = _err.response ? _err.response.data.errors : _err;
  const errs = toArrayIfNot(err);

  for (const err of errs) {
    logger.error(err.message);
  }

  return errs;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiv3Request<T = any>(method: string, path: string, params: unknown): Promise<AxiosResponse<T>> {
  try {
    const res = await axios[method](urljoin(apiv3Root, path), params);
    return res;
  }
  catch (err) {
    const errors = apiv3ErrorHandler(err);
    throw errors;
  }
}

export async function apiv3Get<T = any>(path: string, params: unknown = {}): Promise<AxiosResponse<T>> {
  return apiv3Request('get', path, { params });
}

export async function apiv3Post<T = any>(path: string, params: unknown = {}): Promise<AxiosResponse<T>> {
  return apiv3Request('post', path, params);
}

export async function apiv3PostForm<T = any>(path: string, formData: FormData): Promise<AxiosResponse<T>> {
  return apiv3Post<T>(path, formData);
}

export async function apiv3Put<T = any>(path: string, params: unknown = {}): Promise<AxiosResponse<T>> {
  return apiv3Request('put', path, params);
}

export async function apiv3Delete<T = any>(path: string, params: unknown = {}): Promise<AxiosResponse<T>> {
  return apiv3Request('delete', path, { params });
}
