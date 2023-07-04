import { ErrorV3 } from '^/../../packages/core/dist';
import mongoose from 'mongoose';

import { LoginErrorCode } from '~/interfaces/errors/login-error';
import { IExternalAccount } from '~/interfaces/external-account';
import loggerFactory from '~/utils/logger';

import { NullUsernameToBeRegisteredError } from '../models/errors';

import PassportService from './passport';

const logger = loggerFactory('growi:service:external-account-service');

class ExternalAccountService {

  passportService: PassportService;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(passportService: PassportService) {
    this.passportService = passportService;
  }

  async getOrCreateUser(userInfo: {id: string, username: string, name?: string, email?: string}, providerId: string): Promise<IExternalAccount | undefined> {
    // get option
    const isSameUsernameTreatedAsIdenticalUser = this.passportService.isSameUsernameTreatedAsIdenticalUser(providerId);
    const isSameEmailTreatedAsIdenticalUser = this.passportService.isSameEmailTreatedAsIdenticalUser(providerId);

    const ExternalAccount = mongoose.model('ExternalAccount') as any;

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
    }
  }

}

// eslint-disable-next-line import/no-mutable-exports
export let externalAccountService: ExternalAccountService | undefined; // singleton instance
export function instanciate(passportService: PassportService): void {
  externalAccountService = new ExternalAccountService(passportService);
}
