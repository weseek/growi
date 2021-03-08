import * as urljoin from 'url-join';

import axios from '~/utils/axios';
import Apiv1ErrorHandler from './apiv1ErrorHandler';

const apiv1Root = '/_api';

export async function apiRequest(method: string, path: string, params: any): Promise<any> {
  const res = await axios[method](urljoin(apiv1Root, path), params);

  if (res.data.ok) {
    return res.data;
  }

  // Return error code if code is exist
  if (res.data.code != null) {
    const error = new Apiv1ErrorHandler(res.data.error, res.data.code);
    throw error;
  }

  throw new Error(res.data.error);
}

export async function apiGet(path: string, params: any = {}): Promise<any> {
  return apiRequest('get', path, { params });
}

export async function apiPost(path: string, params: any = {}): Promise<any> {
  return apiRequest('post', path, params);
}

export async function apiDelete(path: string, params: any = {}): Promise<any> {
  return apiRequest('delete', path, { data: params });
}
