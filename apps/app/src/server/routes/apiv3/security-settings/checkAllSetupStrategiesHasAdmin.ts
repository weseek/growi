import Crowi from '~/server/crowi';

const checkAuthStrategyHasAdmin = (async(crowi: Crowi, strategy: string): Promise<boolean> => {
  const ExternalAccount = crowi.model('ExternalAccount');
  const User = crowi.model('User');

  if (strategy === 'local') {
    // Get all local admin accounts and filter local admins that are not in external accounts
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
  }

  const externalAccounts = await ExternalAccount.find({ providerType: strategy })
    .populate('user', null, { admin: true, status: User.STATUS_ACTIVE })
    .exec();

  const hasAdmin = externalAccounts.some(account => account.user !== null);

  return hasAdmin;
});


export const checkAllSetupStrategiesHasAdmin = (async(crowi: Crowi, setupStrategies: string[]): Promise<boolean> => {
  const results = await Promise.all(setupStrategies.map(async(strategy) => {
    const hasAdmin = await checkAuthStrategyHasAdmin(crowi, strategy);
    return hasAdmin;
  }));

  return results.some(hasAdmin => hasAdmin);
});
