export const REQUEST_TIMEOUT_FOR_GTOP = 10000;

export const REQUEST_TIMEOUT_FOR_PTOG = 10000;

export const supportedSlackCommands: string[] = [
  '/growi',
];

export const supportedGrowiCommands: string[] = [
  'search',
  'create',
  'togetter',
  'help',
];

export const defaultSupportedCommandsNameForBroadcastUse: string[] = [
  'search',
];

export const defaultSupportedCommandsNameForSingleUse: string[] = [
  'create',
  'togetter',
];

export * from './interfaces/growi-command-processor';
export * from './interfaces/growi-interaction-processor';
export * from './interfaces/growi-command';
export * from './interfaces/request-between-growi-and-proxy';
export * from './interfaces/request-from-slack';
export * from './interfaces/slackbot-types';
export * from './models/errors';
export * from './middlewares/parse-slack-interaction-request';
export * from './middlewares/verify-growi-to-slack-request';
export * from './middlewares/verify-slack-request';
export * from './utils/block-kit-builder';
export * from './utils/check-communicable';
export * from './utils/get-supported-growi-actions-regexps';
export * from './utils/post-ephemeral-errors';
export * from './utils/publish-initial-home-view';
export * from './utils/reshape-contents-body';
export * from './utils/response-url';
export * from './utils/slash-command-parser';
export * from './utils/webclient-factory';
export * from './utils/welcome-message';
export * from './utils/required-scopes';
export * from './utils/payload-interaction-id-helpers';
