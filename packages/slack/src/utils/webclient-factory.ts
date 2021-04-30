import { LogLevel, WebClient } from '@slack/web-api';

const isProduction = process.env.NODE_ENV === 'production';

export const generateWebClient = (botToken: string): WebClient => {
  return new WebClient(botToken, { logLevel: isProduction ? LogLevel.DEBUG : LogLevel.INFO });
};
