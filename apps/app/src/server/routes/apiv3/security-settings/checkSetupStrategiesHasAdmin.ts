import type { IExternalAuthProviderType } from '@growi/core';

import Crowi from '~/server/crowi';

interface AggregateResult {
  count: number;
}

const checkLocalStrategyHasAdmin = async(crowi: Crowi): Promise<boolean> => {
  const User = crowi.model('User');

  const localAdmins: AggregateResult[] = await User.aggregate([
    {
      $match: {
        admin: true,
        status: User.STATUS_ACTIVE,
        password: { $exists: true },
      },
    },
    { $count: 'count' },
  ]).exec();

  return localAdmins.length > 0 && localAdmins[0].count > 0;
};

const checkExternalStrategiesHasAdmin = async(crowi: Crowi, setupExternalStrategies: IExternalAuthProviderType[]): Promise<boolean> => {
  const User = crowi.model('User');

  const externalAdmins: AggregateResult[] = await User.aggregate([
    { $match: { admin: true, status: User.STATUS_ACTIVE } },
    {
      $lookup: {
        from: 'externalaccounts',
        localField: '_id',
        foreignField: 'user',
        as: 'externalAccounts',
      },
    },
    {
      $match: {
        'externalAccounts.providerType': { $in: setupExternalStrategies },
      },
    },
    { $count: 'count' },
  ]).exec();

  return externalAdmins.length > 0 && externalAdmins[0].count > 0;
};

export const checkSetupStrategiesHasAdmin = async(crowi: Crowi, setupStrategies: (IExternalAuthProviderType | 'local')[]): Promise<boolean> => {
  if (setupStrategies.includes('local')) {
    const isLocalStrategyHasAdmin = await checkLocalStrategyHasAdmin(crowi);
    if (isLocalStrategyHasAdmin) {
      return true;
    }
  }

  const setupExternalStrategies = setupStrategies.filter(strategy => strategy !== 'local') as IExternalAuthProviderType[];
  if (setupExternalStrategies.length === 0) {
    return false;
  }

  const isExternalStrategiesHasAdmin = await checkExternalStrategiesHasAdmin(crowi, setupExternalStrategies);

  return isExternalStrategiesHasAdmin;
};
