/*
 * TODO 85062: AdminUserGroupDetailContainer is under transplantation to UserGroupDetailPage.tsx
 */

import { isServer } from '@growi/core';
import { Container } from 'unstated';

import {
  apiv3Get, apiv3Delete, apiv3Put, apiv3Post,
} from '~/client/util/apiv3-client';
import loggerFactory from '~/utils/logger';

import { toastError } from '../util/apiNotification';


// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:AdminUserGroupDetailContainer');

/**
 * Service container for admin user group detail page (UserGroupDetailPage.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminUserGroupDetailContainer extends Container {

  constructor(appContainer) {
    super();

    if (isServer()) {
      return;
    }

    this.appContainer = appContainer;

    // const rootElem = document.getElementById('admin-user-group-detail');

    // if (rootElem == null) {
    //   return;
    // }

    this.state = {
      // TODO: [SPA] get userGroup from props
      userGroupRelations: [], // For user list

      // TODO 85062: /_api/v3/user-groups/children?include_grand_child=boolean
      childUserGroups: [], // TODO 85062: fetch data on init (findChildGroupsByParentIds) For child group list
      grandChildUserGroups: [], // TODO 85062: fetch data on init (findChildGroupsByParentIds) For child group list

      childUserGroupRelations: [], // TODO 85062: fetch data on init (findRelationsByGroupIds) For child group list users
      // relatedPages: [], // For page list
      isUserGroupUserModalOpen: false,
      searchType: 'partial',
      isAlsoMailSearched: false,
      isAlsoNameSearched: false,
    };

    // this.init();

    this.switchIsAlsoMailSearched = this.switchIsAlsoMailSearched.bind(this);
    this.switchIsAlsoNameSearched = this.switchIsAlsoNameSearched.bind(this);
    this.openUserGroupUserModal = this.openUserGroupUserModal.bind(this);
    this.closeUserGroupUserModal = this.closeUserGroupUserModal.bind(this);
    this.addUserByUsername = this.addUserByUsername.bind(this);
    this.removeUserByUsername = this.removeUserByUsername.bind(this);
    this.fetchApplicableUsers = this.fetchApplicableUsers.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminUserGroupDetailContainer';
  }


  /**
   * switch isAlsoMailSearched
   */
  switchIsAlsoMailSearched() {
    this.setState({ isAlsoMailSearched: !this.state.isAlsoMailSearched });
  }

  /**
   * switch isAlsoNameSearched
   */
  switchIsAlsoNameSearched() {
    this.setState({ isAlsoNameSearched: !this.state.isAlsoNameSearched });
  }

  /**
   * switch searchType
   */
  switchSearchType(searchType) {
    this.setState({ searchType });
  }

  /**
   * open a modal
   *
   * @memberOf AdminUserGroupDetailContainer
   */
  async openUserGroupUserModal() {
    await this.setState({ isUserGroupUserModalOpen: true });
  }

  /**
   * close a modal
   *
   * @memberOf AdminUserGroupDetailContainer
   */
  async closeUserGroupUserModal() {
    await this.setState({ isUserGroupUserModalOpen: false });
  }

  // /**
  //  * search user for invitation
  //  * @param {string} username username of the user to be searched
  //  */
  // async fetchApplicableUsers(searchWord) {
  //   const res = await apiv3Get(`/user-groups/${this.state.userGroup._id}/unrelated-users`, {
  //     searchWord,
  //     searchType: this.state.searchType,
  //     isAlsoMailSearched: this.state.isAlsoMailSearched,
  //     isAlsoNameSearched: this.state.isAlsoNameSearched,
  //   });

  //   const { users } = res.data;

  //   return users;
  // }


  // /**
  //  * update user group
  //  *
  //  * @memberOf AdminUserGroupDetailContainer
  //  * @param {string} username username of the user to be added to the group
  //  */
  // async addUserByUsername(username) {
  //   const res = await apiv3Post(`/user-groups/${this.state.userGroup._id}/users/${username}`);

  //   // do not add users for ducaplicate
  //   if (res.data.userGroupRelation == null) { return }

  //   this.init();
  // }

  /**
   * update user group
   *
   * @memberOf AdminUserGroupDetailContainer
   * @param {string} username username of the user to be removed from the group
   */
  async removeUserByUsername(username) {
    const res = await apiv3Delete(`/user-groups/${this.state.userGroup._id}/users/${username}`);

    this.setState((prevState) => {
      return {
        userGroupRelations: prevState.userGroupRelations.filter((u) => { return u._id !== res.data.userGroupRelation._id }),
      };
    });
  }

}
