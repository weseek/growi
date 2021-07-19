import { LogLevel, WebClient } from '@slack/web-api';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Generate WebClilent instance
 * @param token Slack Bot Token or Proxy Server URI
 * @returns
 */
export const generateWebClient = (token: string, serverUri?: string, headers?:{[key:string]:string}): WebClient => {
  return new WebClient(
    token,
    {
      slackApiUrl: serverUri,
      logLevel: isProduction ? LogLevel.DEBUG : LogLevel.INFO,
      headers,
      retryConfig: { retries: 3 },
    },
  );
};
