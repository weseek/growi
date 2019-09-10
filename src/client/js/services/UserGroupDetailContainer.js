import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

import { toastError } from '../util/apiNotification';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:UserGroupDetailContainer');

/**
 * Service container for admin user group detail page (UserGroupDetailPage.jsx)
 * @extends {Container} unstated Container
 */
export default class UserGroupDetailContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      // TODO: [SPA] get userGroup from props
      userGroup: JSON.parse(document.getElementById('admin-user-group-detail').getAttribute('data-user-group')),
      userGroupRelations: [],
      unrelatedUsers: [],
      relatedPages: [],
      isUserGroupUserModalOpen: false,
    };

    this.init();

    this.openUserGroupUserModal = this.openUserGroupUserModal.bind(this);
    this.closeUserGroupUserModal = this.closeUserGroupUserModal.bind(this);
    this.addUserByUsername = this.addUserByUsername.bind(this);
    this.removeUserByUsername = this.removeUserByUsername.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'UserGroupDetailContainer';
  }

  /**
   * retrieve user group data
   */
  async init() {
    try {
      const [
        unrelatedUsers,
        userGroupRelations,
        relatedPages,
      ] = await Promise.all([
        this.appContainer.apiv3.get(`/user-groups/${this.state.userGroup._id}/unrelated-users`).then((res) => { return res.data.users }),
        this.appContainer.apiv3.get(`/user-groups/${this.state.userGroup._id}/user-group-relations`).then((res) => { return res.data.userGroupRelations }),
        this.appContainer.apiv3.get(`/user-groups/${this.state.userGroup._id}/pages`).then((res) => { return res.data.pages }),
      ]);

      await this.setState({
        unrelatedUsers,
        userGroupRelations,
        relatedPages,
      });
    }
    catch (err) {
      logger.error(err);
      toastError(new Error('Failed to fetch data'));
    }
  }

  async updateUserGroup(param) {
    const res = await this.appContainer.apiv3.put(`/user-groups/${this.state.userGroup._id}`, param);
    const { userGroup } = res.data;

    await this.setState({ userGroup });

    return res;
  }

  async openUserGroupUserModal() {
    await this.setState({ isUserGroupUserModalOpen: true });
  }

  async closeUserGroupUserModal() {
    await this.setState({ isUserGroupUserModalOpen: false });
  }

  async addUserByUsername(username) {
    const res = await this.appContainer.apiv3.post(`/user-groups/${this.state.userGroup._id}/users/${username}`);
    const { user, userGroupRelation } = res.data;

    this.setState((prevState) => {
      return {
        userGroupRelations: [...prevState.userGroupRelations, userGroupRelation],
        unrelatedUsers: prevState.unrelatedUsers.filter((u) => { return u._id !== user._id }),
      };
    });
  }

  async removeUserByUsername(username) {
    const res = await this.appContainer.apiv3.delete(`/user-groups/${this.state.userGroup._id}/users/${username}`);

    this.setState((prevState) => {
      return {
        userGroupRelations: prevState.userGroupRelations.filter((u) => { return u._id !== res.data.userGroupRelation._id }),
        unrelatedUsers: [...prevState.unrelatedUsers, res.data.user],
      };
    });
  }

}
