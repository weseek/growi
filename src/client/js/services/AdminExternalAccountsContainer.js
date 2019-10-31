import { Container } from 'unstated';

import loggerFactory from '@alias/logger';


// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:AdminexternalaccountsContainer');

/**
 * Service container for admin external-accounts page (ManageExternalAccountsContainer.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminExternalAccountsContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      users: JSON.parse(document.getElementById('admin-external-account-setting').getAttribute('external-accounts')) || [],
      exteranalAccounts: [],
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
   * update external-account
   *
   * @memberOf AdminExternalAccountsContainer
   * @param {object} param update param for external account
   * @return {object} response object
   */
  async updateExternalAccount(param) {
    const res = await this.appContainer.apiv3.put(`/users/external-accounts/${this.state.externalAccounts._id}`, param);
    const { exteranalAccounts } = res.data;

    await this.setState({ exteranalAccounts });

    return res;
  }

  /**
   * syncExternalAccounts of selectedPage
   * @memberOf AdminExternalAccountsContainer
   * @param {number} selectedPage
   */
  async retrieveExternalAccountsByPagingNum(selectedPage) {

    const params = { page: selectedPage };
    const { data } = await this.appContainer.apiv3.get('/users/external-accounts', params);


    if (data.paginateResult == null) {
      throw new Error('data must conclude \'paginateResult\' property.');
    }
    const { docs: exteranalAccounts, totalDocs: totalAccounts, limit: pagingLimit } = data.paginateResult;
    this.setState({
      exteranalAccounts,
      totalAccounts,
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
