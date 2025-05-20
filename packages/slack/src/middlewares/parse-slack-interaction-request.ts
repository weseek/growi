import type { Response, NextFunction } from 'express';

import type { RequestFromSlack } from '../interfaces/request-from-slack';
import { InteractionPayloadAccessor } from '../utils/interaction-payload-accessor';


export const parseSlackInteractionRequest = (req: RequestFromSlack, res: Response, next: NextFunction): Record<string, any> | void => {
  // There is no payload in the request from slack
  if (req.body.payload == null) {
    return next();
  }

  req.interactionPayload = JSON.parse(req.body.payload);
  req.interactionPayloadAccessor = new InteractionPayloadAccessor(req.interactionPayload);

  return next();
};
