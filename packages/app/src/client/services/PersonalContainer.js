import { Container } from 'unstated';

import loggerFactory from '~/utils/logger';

import { apiv3Put } from '../util/apiv3-client';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:PersonalContainer');

/**
 * Service container for personal settings page (PersonalSettings.jsx)
 * @extends {Container} unstated Container
 */
export default class PersonalContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      retrieveError: null,
      name: '',
      email: '',
      isEmailPublished: false,
      lang: 'en_US',
      isGravatarEnabled: false,
      externalAccounts: [],
      apiToken: '',
      slackMemberId: '',
    };

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'PersonalContainer';
  }


  /**
   * Associate LDAP account
   */
  async associateLdapAccount(account) {
    try {
      await apiv3Put('/personal-setting/associate-ldap', account);
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to associate ldap account');
    }
  }

  /**
   * Disassociate LDAP account
   */
  async disassociateLdapAccount(account) {
    try {
      await apiv3Put('/personal-setting/disassociate-ldap', account);
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to disassociate ldap account');
    }
  }

}
