import type { GrowiExternalAuthProviderType } from '~/features/questionnaire/interfaces/growi-info';
import Crowi from '~/server/crowi';


const checkLocalStrategyHasAdmin = (async(crowi: Crowi): Promise<boolean> => {
  // TODO: update check local strategy has admin methods
  const User = crowi.model('User');

  const localAdmins = await User.aggregate([
    { $match: { admin: true, status: User.STATUS_ACTIVE } },
    {
      $lookup: {
        from: 'externalaccounts',
        localField: '_id',
        foreignField: 'user',
        as: 'externalAccounts',
      },
    },
    { $match: { externalAccounts: [] } },
  ]).exec();
  return localAdmins.length > 0;
});

const checkExternalStrategiesHasAdmin = (async(crowi: Crowi, setupStrategies: GrowiExternalAuthProviderType[]): Promise<boolean> => {
  // TODO: update check external strategy has admin methods
  const ExternalAccount = crowi.model('ExternalAccount');
  const User = crowi.model('User');

  const results = await Promise.all(setupStrategies.map(async(strategy) => {
    const externalAccounts = await ExternalAccount.find({ providerType: strategy })
      .populate('user', null, { admin: true, status: User.STATUS_ACTIVE })
      .exec();

    const hasAdmin = externalAccounts.some(account => account.user !== null);
    return hasAdmin;
  }));

  return results.some(hasAdmin => hasAdmin);
});

export const checkSetupStrategiesHasAdmin = (async(crowi: Crowi, setupStrategies: (GrowiExternalAuthProviderType | 'local')[]): Promise<boolean> => {
  if (setupStrategies.includes('local')) {
    const isLocalStrategyHasAdmin = await checkLocalStrategyHasAdmin(crowi);
    if (isLocalStrategyHasAdmin) {
      return true;
    }
  }

  const setupStrategiesWithoutLocal = setupStrategies.filter(strategy => strategy !== 'local') as GrowiExternalAuthProviderType[];
  const isExternalStrategiesHasAdmin = await checkExternalStrategiesHasAdmin(crowi, setupStrategiesWithoutLocal);

  return isExternalStrategiesHasAdmin;
});
