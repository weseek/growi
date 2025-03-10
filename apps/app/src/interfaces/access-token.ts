
export type IAccessTokenInfo = {
  expiredAt: Date,
  description: string,
  scope: string[],
}

export type IResGenerateAccessToken = IAccessTokenInfo & {
  token: string,
  _id: string,
}

export type IResGetAccessToken = IAccessTokenInfo & {
  _id: string,
}
