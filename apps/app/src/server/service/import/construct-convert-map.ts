import type Crowi from '~/server/crowi';

import type { OverwriteFunction } from './overwrite-function';
import { keepOriginal } from './overwrite-function';


export type ConvertMap = {
  [collectionName: string]: {
    [propertyName: string]: OverwriteFunction,
  }
}

/**
 * initialize convert map. set keepOriginal as default
 *
 * @param {Crowi} crowi Crowi instance
 */
export const constructConvertMap = (crowi: Crowi): ConvertMap => {
  const convertMap: ConvertMap = {};

  const models = crowi.models;

  // by default, original value is used for imported documents
  for (const model of Object.values(models)) {
    if (model.collection == null) {
      continue;
    }

    const collectionName = model.collection.name;

    console.log({ collectionName });

    convertMap[collectionName] = {};

    for (const key of Object.keys(model.schema.paths)) {
      convertMap[collectionName][key] = keepOriginal;
    }
  }

  return convertMap;
};
