import type { Request } from 'express';

export interface IInteractionPayloadAccessor {
  firstAction(): any;
}

export type RequestFromSlack = Request & {
  // appended by slack
  headers:{'x-slack-signature'?:string, 'x-slack-request-timestamp':number},

  // appended by GROWI or slackbot-proxy
  slackSigningSecret?:string,

  interactionPayload?: any,
  interactionPayloadAccessor?: any,
};
