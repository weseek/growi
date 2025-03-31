import type { Scope } from './scope';

export type IAccessTokenInfo = {
  expiredAt: Date,
  description: string,
  scopes: Scope[],
}

export type IResGenerateAccessToken = IAccessTokenInfo & {
  token: string,
  _id: string,
}

export type IResGetAccessToken = IAccessTokenInfo & {
  _id: string,
}
