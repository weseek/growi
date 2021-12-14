export const REQUEST_TIMEOUT_FOR_GTOP = 10000;

export const REQUEST_TIMEOUT_FOR_PTOG = 10000;

export const supportedSlackCommands: string[] = [
  '/growi',
];

export const supportedGrowiCommands: string[] = [
  'search',
  'note',
  'keep',
  'help',
];

export const defaultSupportedCommandsNameForBroadcastUse: string[] = [
  'search',
];

export const defaultSupportedCommandsNameForSingleUse: string[] = [
  'note',
  'keep',
];

export const defaultSupportedSlackEventActions: string[] = [
  'unfurl',
];

export * from './interfaces/channel';
export * from './interfaces/growi-command-processor';
export * from './interfaces/growi-interaction-processor';
export * from './interfaces/growi-event-processor';
export * from './interfaces/growi-command';
export * from './interfaces/growi-bot-event';
export * from './interfaces/request-between-growi-and-proxy';
export * from './interfaces/request-from-slack';
export * from './interfaces/response-url';
export * from './interfaces/slackbot-types';
export * from './interfaces/response-url';
export * from './interfaces/respond-util';
export * from './models/errors';
export * from './middlewares/parse-slack-interaction-request';
export * from './middlewares/verify-growi-to-slack-request';
export * from './middlewares/verify-slack-request';
export * from './utils/block-kit-builder';
export * from './utils/check-communicable';
export * from './utils/generate-last-update-markdown';
export * from './utils/get-supported-growi-actions-regexps';
export * from './utils/post-ephemeral-errors';
export * from './utils/publish-initial-home-view';
export * from './utils/reshape-contents-body';
export * from './utils/response-url';
export * from './utils/slash-command-parser';
export * from './utils/webclient-factory';
export * from './utils/required-scopes';
export * from './utils/permission-parser';
export * from './utils/interaction-payload-accessor';
export * from './utils/payload-interaction-id-helpers';
export * from './utils/respond-util-factory';
