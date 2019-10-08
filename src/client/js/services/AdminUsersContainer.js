import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:UserGroupDetailContainer');

/**
 * Service container for admin users page (Users.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminUsersContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      users: JSON.parse(document.getElementById('admin-user-page').getAttribute('users')) || [],
      exteranalAccounts: JSON.parse(document.getElementById('admin-external-account').getAttribute('external-account')) || [],
      isPasswordResetModalShown: false,
      isUserInviteModalShown: false,
      userForPasswordResetModal: null,
    };

    this.showPasswordResetModal = this.showPasswordResetModal.bind(this);
    this.hidePasswordResetModal = this.hidePasswordResetModal.bind(this);
    this.toggleUserInviteModal = this.toggleUserInviteModal.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminUsersContainer';
  }

  /**
   * open reset password modal, and props user
   * @memberOf AdminUsersContainer
   * @param {object} user
   */
  async showPasswordResetModal(user) {
    await this.setState({
      isPasswordResetModalShown: true,
      userForPasswordResetModal: user,
    });
  }

  /**
   * close reset password modal
   * @memberOf AdminUsersContainer
   */
  async hidePasswordResetModal() {
    await this.setState({ isPasswordResetModalShown: false });
  }

  /**
   * toggle user invite modal
   * @memberOf AdminUsersContainer
   */
  async toggleUserInviteModal() {
    await this.setState({ isUserInviteModalShown: !this.state.isUserInviteModalShown });
  }

  /**
   * remove user
   * @memberOf AdminUsersContainer
   * @param {string} userId
   * @return {string} username
   */
  async removeUser(userId) {
    const response = await this.appContainer.apiv3.delete(`/users/${userId}/remove`);
    const { username } = response.data.userData;
    return username;
  }

}
