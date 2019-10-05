import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:UserGroupDetailContainer');

/**
 * Service container for admin users page (Users.jsx)
 * @extends {Container} unstated Container
 */
export default class UsersContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      users: JSON.parse(document.getElementById('admin-user-page').getAttribute('users')) || [],
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
    return 'UsersContainer';
  }

  /**
   * passwordリセットモーダルが開き、userが渡される
   * @param {object} user
   */
  showPasswordResetModal(user) {
    this.setState({
      isPasswordResetModalShown: true,
      userForPasswordResetModal: user,
    });
  }

  hidePasswordResetModal() {
    this.setState({ isPasswordResetModalShown: false });
  }

  /**
   * user招待モーダルを開閉する TODO i18n
   */
  toggleUserInviteModal() {
    this.setState({ isUserInviteModalShown: !this.state.isUserInviteModalShown });
  }

}
