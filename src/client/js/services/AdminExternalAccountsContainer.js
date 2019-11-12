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
      externalAccounts: [],
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
    const { data } = await this.appContainer.apiv3.get('/users/external-accounts', params);

    if (data.paginateResult == null) {
      throw new Error('data must conclude \'paginateResult\' property.');
    }
    const { docs: externalAccounts, totalDocs: totalAccounts, limit: pagingLimit } = data.paginateResult;
    this.setState({
      externalAccounts,
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
