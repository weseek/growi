import { Container } from 'unstated';

import loggerFactory from '@alias/logger';


// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:UserGroupDetailContainer');

/**
 * Service container for admin users page (Users.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminExternalAccountContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      exteranalAccounts: JSON.parse(document.getElementById('admin-external-account-setting').getAttribute('external-account')) || [],
      totalAccounts: 0,
      activePage: 1,
      pagingLimit: Infinity,
    };

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminExternalAccountsContainer';
  }

  /**
   * syncExternalAccounts of selectedPage
   * @memberOf AdminExternalAccountsContainer
   * @param {number} selectedPage
   */
  async retrieveExternalAccountsByPagingNum(selectedPage) {

    const params = { page: selectedPage };
    const response = await this.appContainer.apiv3.get('/users/external-accounts', params);

    const users = response.data.exteranalAccounts;
    const totalUsers = response.data.totalAccounts;
    const pagingLimit = response.data.pagingLimit;

    this.setState({
      users,
      totalUsers,
      pagingLimit,
      activePage: selectedPage,
    });

  }

  /**
   * remove external account
   *
   * @memberOf AdminExternalAccountsContainer
   * @param {string} externalAccountId id of the External Account to be removed
   */
  async removeExternal(externalAccountId) {
    const res = await this.appContainer.apiv3.delete(`/users/external-accounts/${externalAccountId}/remove`);
    const externalAccountData = res.data.exteranalAccount;
    return externalAccountData;
  }

}
