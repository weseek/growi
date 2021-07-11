// see: https://api.slack.com/reference/interaction-payloads/views
export type ViewElement = {
  type: string,
  'private_metadata'?: any,
}

// see: https://api.slack.com/reference/interaction-payloads/views
export type ViewInteractionPayload = {
  type: string,
  view: {
    'private_metadata'?: any,
  },
}

// see: https://api.slack.com/reference/block-kit/blocks
export type BlockElement = {
  type: string,
  element?: { type: string } & any,
  elements?: ({ type: string } & any)[],
}

// see: https://api.slack.com/reference/interaction-payloads/block-actions
export type BlockActionsPayload = {
  type: string,
}

export type GrowiUriWithOriginalData = {
  growiUri: string,
  originalData: string,
}

/**
 * Type guard for GrowiUriWithOriginalData
 * @param data
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isGrowiUriWithOriginalData = (data: any): data is GrowiUriWithOriginalData => {
  return data.growiUri != null && data.originalData != null;
};

export interface GrowiUriInjector<IDATA extends ViewElement|BlockElement[], EDATA extends (ViewInteractionPayload|BlockActionsPayload)> {

  shouldHandleToInject(data: IDATA): boolean;
  inject(data: IDATA, growiUri:string): void;

  shouldHandleToExtract(data: EDATA): boolean;
  extract(data: EDATA): GrowiUriWithOriginalData;

}

export interface ObsoleteGrowiUriInjector {

  inject(body: any, growiUri:string): void;

  extract(body: any):any;
}
