export type IApiRateLimitConfig = {
  [endpoint: string]: {
    method: string,
    maxRequests: number
  }
}
