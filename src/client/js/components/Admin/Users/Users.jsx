import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import PasswordResetModal from './PasswordResetModal';
import PaginationWrapper from '../../PaginationWrapper';
import InviteUserControl from './InviteUserControl';
import UserTable from './UserTable';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminUsersContainer from '../../../services/AdminUsersContainer';

class UserPage extends React.Component {

  constructor(props) {
    super();

    this.state = {
      totalUsers: 0,
      activePage: 1,
      pagingLimit: Infinity,
    };

    this.handlePage = this.handlePage.bind(this);
  }

  async handlePage(selectedPage) {
    await this.setState({ activePage: selectedPage });
    await this.syncUserGroupAndRelations();
  }

  async syncUserGroupAndRelations() {

    try {
      const params = { page: this.state.activePage };
      const response = await this.props.appContainer.apiv3.get('/users', params);

      const users = response.data.users;
      const totalUsers = response.data.totalUsers;
      const pagingLimit = response.data.pagingLimit;

      this.props.adminUsersContainer.setState({ users });

      this.setState({
        totalUsers,
        pagingLimit,
      });
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminUsersContainer } = this.props;

    return (
      <Fragment>
        {adminUsersContainer.state.userForPasswordResetModal && <PasswordResetModal />}
        <p>
          <InviteUserControl />
          <a className="btn btn-default btn-outline ml-2" href="/admin/users/external-accounts">
            <i className="icon-user-follow" aria-hidden="true"></i>
            { t('user_management.external_account') }
          </a>
        </p>
        <UserTable />
        <PaginationWrapper
          activePage={this.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={this.state.totalUsers}
          pagingLimit={this.state.pagingLimit}
        />
      </Fragment>
    );
  }

}

const UserPageWrapper = (props) => {
  return createSubscribedElement(UserPage, props, [AppContainer, AdminUsersContainer]);
};

UserPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,

};

export default withTranslation()(UserPageWrapper);
