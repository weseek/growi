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

export async function apiRequest<T>(method: string, path: string, params: unknown): Promise<T> {
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

export async function apiGet<T>(path: string, params: unknown = {}): Promise<T> {
  return apiRequest<T>('get', path, { params });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiPost<T>(path: string, params: any & ParamWithCsrfKey = {}): Promise<T> {
  if (params._csrf == null) {
    params._csrf = csrfToken;
  }
  return apiRequest<T>('post', path, params);
}

export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  if (formData.get('_csrf') == null && csrfToken != null) {
    formData.append('_csrf', csrfToken);
  }
  return apiPost<T>(path, formData);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiDelete<T>(path: string, params: any & ParamWithCsrfKey = {}): Promise<T> {
  if (params._csrf == null) {
    params._csrf = csrfToken;
  }
  return apiRequest<T>('delete', path, { data: params });
}
