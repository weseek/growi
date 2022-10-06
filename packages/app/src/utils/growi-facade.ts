import { GrowiFacade, isServer } from '@growi/core';
import deepmerge from 'ts-deepmerge';

import { CustomWindow } from '~/interfaces/global';

export const getGrowiFacade = (): GrowiFacade => {
  if (isServer()) {
    return {};
  }

  if ((window as CustomWindow).growiFacade == null) {
    (window as CustomWindow).growiFacade = {};
  }

  return (window as CustomWindow).growiFacade;
};

export const registerGrowiFacade = (addedFacade: GrowiFacade): void => {
  if (isServer()) {
    throw new Error('This method is available only in client.');
  }

  (window as CustomWindow).growiFacade = deepmerge(
    getGrowiFacade(),
    addedFacade,
  );
};
