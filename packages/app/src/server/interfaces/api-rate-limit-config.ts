export type IApiRateLimitConfig = {
  [endpoint: string]: {
    method: string,
    consumePoints: number
  }
}
