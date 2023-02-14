export type GrowiUriWithOriginalData = {
  growiUri: string,
  originalData: string,
}

export type TypedBlock = {
  type: string,
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

export interface GrowiUriInjector<ISDATA, IDATA, ESDATA, EDATA> {

  shouldHandleToInject(data: ISDATA & any): data is IDATA;
  inject(data: IDATA, growiUri:string): void;

  shouldHandleToExtract(data: ESDATA & any): data is EDATA;
  extract(data: EDATA): GrowiUriWithOriginalData;

}
