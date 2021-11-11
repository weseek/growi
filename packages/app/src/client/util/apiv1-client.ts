import * as urljoin from 'url-join';

import axios from '~/utils/axios';

const apiv1Root = '/_api';

// get csrf token from body element
const body = document.querySelector('body');
const csrfToken = body?.dataset.csrftoken;


type ParamWithCsrfKey = {
  _csrf: string,
}

class Apiv1ErrorHandler extends Error {

  code;

  data;

  constructor(message = '', code = '', data = '') {
    super();

    this.message = message;
    this.code = code;
    this.data = data;

  }

}

export async function apiRequest(method: string, path: string, params: unknown): Promise<unknown> {
  const res = await axios[method](urljoin(apiv1Root, path), params);

  if (res.data.ok) {
    return res.data;
  }

  // Return error code if code is exist
  if (res.data.code != null) {
    const error = new Apiv1ErrorHandler(res.data.error, res.data.code, res.data.data);
    throw error;
  }

  throw new Error(res.data.error);
}

export async function apiGet(path: string, params: unknown = {}): Promise<unknown> {
  return apiRequest('get', path, { params });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiPost(path: string, params: any & ParamWithCsrfKey = {}): Promise<unknown> {
  if (params._csrf == null) {
    params._csrf = csrfToken;
  }
  return apiRequest('post', path, params);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiDelete(path: string, params: any & ParamWithCsrfKey = {}): Promise<unknown> {
  if (params._csrf == null) {
    params._csrf = csrfToken;
  }
  return apiRequest('delete', path, { data: params });
}
