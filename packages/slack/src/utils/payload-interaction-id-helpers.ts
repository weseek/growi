// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getActionIdAndCallbackIdFromPayLoad = (interactionPayload: any): {[key: string]: string} => {
  const callbackId: string = interactionPayload?.view?.callback_id;
  // TAICHI TODO: fix this GW-7496
  // const actionId = req.interactionPayloadAccessor.firstAction?.action_id;
  const actionId = interactionPayload.actions?.[0]?.action_id;
  return { actionId, callbackId };
};

export const getInteractionIdRegexpFromCommandName = (commandname: string): RegExp => {
  return new RegExp(`^${commandname}:\\w+`);
};
