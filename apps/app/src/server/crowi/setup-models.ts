import type { Model } from 'mongoose';

import loggerFactory from '~/utils/logger';

import { modelsDependsOnCrowi } from '../models';

import type Crowi from '.';

const logger = loggerFactory('growi:crowi:setup-models');

type ModelsMap = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [modelName: string]: Model<any>,
}

export const setupModels = (crowi: Crowi): ModelsMap => {
  const modelsMap: ModelsMap = {};

  Object.keys(modelsDependsOnCrowi).forEach((modelName) => {
    const factory = modelsDependsOnCrowi[modelName];

    if (!(factory instanceof Function)) {
      logger.warn(`modelsDependsOnCrowi['${modelName}'] is not a function. skipped.`);
      return;
    }

    modelsMap[modelName] = factory(crowi);
  });

  return modelsMap;
};
