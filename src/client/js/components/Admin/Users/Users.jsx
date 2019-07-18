import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import PaginationWrapper from '../../PaginationWrapper';
import InviteUserControl from './InviteUserControl';
import UserTable from './UserTable';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserPage extends React.Component {

  constructor(props) {
    super();

    this.state = {
      users: [],
      activePage: 1,
      totalUsers: 0,
      pagingLimit: Infinity,
    };

  }

  async syncUsersAndRelations() {
    let users = [];
    let userRelations = {};
    let totalUsers = 0;
    let pagingLimit = Infinity;

    try {
      const params = { page: this.state.activePage };
      const responses = await Promise.all([
        this.props.appContainer.apiv3.get('/user-groups', params),
        this.props.appContainer.apiv3.get('/user-group-relations', params),
      ]);

      const [usersRes, userRelationsRes] = responses;
      users = usersRes.data.users;
      totalUsers = usersRes.data.totalUsers;
      pagingLimit = usersRes.data.pagingLimit;
      userRelations = userRelationsRes.data.userRelations;

      this.setState({
        users,
        userRelations,
        totalUsers,
        pagingLimit,
      });
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <p>
          <InviteUserControl />
          <a className="btn btn-default btn-outline ml-2" href="/admin/users/external-accounts">
            <i className="icon-user-follow" aria-hidden="true"></i>
            { t('user_management.external_account') }
          </a>
        </p>
        <UserTable
          users={this.state.users}
          onDelete={this.showDeleteModal}
          userRelations={this.state.userRelations}
        />
        <PaginationWrapper
          activePage={this.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={this.state.totalUsers}
          pagingLimit={this.state.pagingLimit}
        >
        </PaginationWrapper>
      </Fragment>
    );
  }

}

const UserPageWrapper = (props) => {
  return createSubscribedElement(UserPage, props, [AppContainer]);
};

UserPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(UserPageWrapper);
