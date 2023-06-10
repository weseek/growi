import { ErrorV3 } from '^/../../packages/core/dist';

import { LoginErrorCode } from '~/interfaces/errors/login-error';
import loggerFactory from '~/utils/logger';

import { NullUsernameToBeRegisteredError } from '../models/errors';

const logger = loggerFactory('growi:service:external-account-service');

class ExternalAccountService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  async getOrCreateUser(userInfo, providerId) {
    // get option
    const isSameUsernameTreatedAsIdenticalUser = this.crowi.passportService.isSameUsernameTreatedAsIdenticalUser(providerId);
    const isSameEmailTreatedAsIdenticalUser = this.crowi.passportService.isSameEmailTreatedAsIdenticalUser(providerId);

    const ExternalAccount = this.crowi.model('ExternalAccount');

    try {
      // find or register(create) user
      const externalAccount = await ExternalAccount.findOrRegister(
        providerId,
        userInfo.id,
        userInfo.username,
        userInfo.name,
        userInfo.email,
        isSameUsernameTreatedAsIdenticalUser,
        isSameEmailTreatedAsIdenticalUser,
      );
      return externalAccount;
    }
    catch (err) {
      /* eslint-disable no-else-return */
      if (err instanceof NullUsernameToBeRegisteredError) {
        logger.error(err.message);
        throw new ErrorV3(err.message);
      }
      else if (err.name === 'DuplicatedUsernameException') {
        if (isSameEmailTreatedAsIdenticalUser || isSameUsernameTreatedAsIdenticalUser) {
          // associate to existing user
          logger.debug(`ExternalAccount '${userInfo.username}' will be created and bound to the exisiting User account`);
          return ExternalAccount.associate(providerId, userInfo.id, err.user);
        }
        logger.error('provider-DuplicatedUsernameException', providerId);

        throw new ErrorV3('message.provider_duplicated_username_exception', LoginErrorCode.PROVIDER_DUPLICATED_USERNAME_EXCEPTION,
          undefined, { failedProviderForDuplicatedUsernameException: providerId });
      }
      else if (err.name === 'UserUpperLimitException') {
        logger.error(err.message);
        throw new ErrorV3(err.message);
      }
      /* eslint-enable no-else-return */
    }
  }

}

export default ExternalAccountService;
