// eslint-disable-next-line no-restricted-imports
import { AxiosResponse } from 'axios';
import * as urljoin from 'url-join';

// eslint-disable-next-line no-restricted-imports

import { toArrayIfNot } from '~/utils/array-utils';
import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';

const apiv3Root = '/_api/v3';

const logger = loggerFactory('growi:apiv3');

// get csrf token from body element
const body = document.querySelector('body');
const csrfToken = body?.dataset.csrftoken;


type ParamWithCsrfKey = {
  _csrf: string,
}

const apiv3ErrorHandler = (_err) => {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiv3Get<T = any>(path: string, params: unknown = {}): Promise<AxiosResponse<T>> {
  return apiv3Request('get', path, { params });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiv3Post<T = any>(path: string, params: any & ParamWithCsrfKey = {}): Promise<AxiosResponse<T>> {
  if (params._csrf == null) {
    params._csrf = csrfToken;
  }
  return apiv3Request('post', path, params);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiv3PostForm<T = any>(path: string, formData: FormData): Promise<AxiosResponse<T>> {
  if (formData.get('_csrf') == null && csrfToken != null) {
    formData.append('_csrf', csrfToken);
  }
  return apiv3Post<T>(path, formData);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiv3Put<T = any>(path: string, params: any & ParamWithCsrfKey = {}): Promise<AxiosResponse<T>> {
  if (params._csrf == null) {
    params._csrf = csrfToken;
  }
  return apiv3Request('put', path, params);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiv3Delete<T = any>(path: string, params: any & ParamWithCsrfKey = {}): Promise<AxiosResponse<T>> {
  if (params._csrf == null) {
    params._csrf = csrfToken;
  }
  return apiv3Request('delete', path, { params });
}
