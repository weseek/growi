/*
 * TODO 85062: AdminUserGroupDetailContainer is under transplantation to UserGroupDetailPage.tsx
 */

import { isServer } from '@growi/core';
import { Container } from 'unstated';

import loggerFactory from '~/utils/logger';


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

    this.state = {
      // TODO: [SPA] get userGroup from props
      userGroupRelations: [], // For user list

      // TODO 85062: /_api/v3/user-groups/children?include_grand_child=boolean
      childUserGroups: [], // TODO 85062: fetch data on init (findChildGroupsByParentIds) For child group list
      grandChildUserGroups: [], // TODO 85062: fetch data on init (findChildGroupsByParentIds) For child group list

      childUserGroupRelations: [], // TODO 85062: fetch data on init (findRelationsByGroupIds) For child group list users
      // relatedPages: [], // For page list
      isUserGroupUserModalOpen: false,
      isAlsoMailSearched: false,
      isAlsoNameSearched: false,
    };

    // this.init();

    this.switchIsAlsoMailSearched = this.switchIsAlsoMailSearched.bind(this);
    this.switchIsAlsoNameSearched = this.switchIsAlsoNameSearched.bind(this);
    this.openUserGroupUserModal = this.openUserGroupUserModal.bind(this);
    this.closeUserGroupUserModal = this.closeUserGroupUserModal.bind(this);
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

}
