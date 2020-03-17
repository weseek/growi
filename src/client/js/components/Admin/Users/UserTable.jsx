import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

import UserPicture from '../../User/UserPicture';
import UserMenu from './UserMenu';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminUsersContainer from '../../../services/AdminUsersContainer';

class UserTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    };

    this.getUserStatusLabel = this.getUserStatusLabel.bind(this);
  }

  /**
   * return status label element by `userStatus`
   * @param {string} userStatus
   * @return status label element
   */
  getUserStatusLabel(userStatus) {
    let additionalClassName;
    let text;

    switch (userStatus) {
      case 1:
        additionalClassName = 'label-info';
        text = 'Approval Pending';
        break;
      case 2:
        additionalClassName = 'label-success';
        text = 'Active';
        break;
      case 3:
        additionalClassName = 'label-warning';
        text = 'Suspended';
        break;
      case 4:
        additionalClassName = 'label-danger';
        text = 'Deleted';
        break;
      case 5:
        additionalClassName = 'label-info';
        text = 'Invited';
        break;
    }

    return (
      <span className={`label ${additionalClassName}`}>
        {text}
      </span>
    );
  }

  /**
   * return admin label element by `isAdmin`
   * @param {string} isAdmin
   * @return admin label element
   */
  getUserAdminLabel(isAdmin) {
    const { t } = this.props;

    if (isAdmin) {
      return <span className="label label-inverse label-admin ml-2">{t('admin:user_management.user_table.administrator')}</span>;
    }
  }

  render() {
    const { t, adminUsersContainer } = this.props;

    return (
      <Fragment>
        <table className="table table-default table-bordered table-user-list">
          <thead>
            <tr>
              <th width="100px">#</th>
              <th>
                <div className="d-flex align-items-center">
                  <div className="mr-2">
                    {t('status')}
                  </div>
                  <div className="d-flex flex-column text-center">
                    <Fragment>
                      <a
                        className={`fa ${(
                          adminUsersContainer.state.sort === 'status')
                          && (adminUsersContainer.state.sortOrder === 'asc') ? 'fa-chevron-up' : 'fa-angle-up'}`}
                        aria-hidden="true"
                        onClick={() => adminUsersContainer.onClickSortAsc('status')}
                      >
                      </a>
                      <a
                        className={`fa ${(
                          adminUsersContainer.state.sort === 'status')
                          && (adminUsersContainer.state.sortOrder === 'desc') ? 'fa-chevron-down' : 'fa-angle-down'}`}
                        aria-hidden="true"
                        onClick={() => adminUsersContainer.onClickSortDesc('status')}
                      >
                      </a>
                    </Fragment>
                  </div>
                </div>
              </th>
              <th>
                <div className="d-flex align-items-center">
                  <div className="mr-2">
                    <code>username</code>
                  </div>
                  <div className="d-flex flex-column text-center">
                    <Fragment>
                      <a
                        className={`fa ${(
                          adminUsersContainer.state.sort === 'username')
                          && (adminUsersContainer.state.sortOrder === 'asc') ? 'fa-chevron-up' : 'fa-angle-up'}`}
                        aria-hidden="true"
                        onClick={() => adminUsersContainer.onClickSortAsc('username')}
                      >
                      </a>
                      <a
                        className={`fa ${(
                          adminUsersContainer.state.sort === 'username')
                          && (adminUsersContainer.state.sortOrder === 'desc') ? 'fa-chevron-down' : 'fa-angle-down'}`}
                        aria-hidden="true"
                        onClick={() => adminUsersContainer.onClickSortDesc('username')}
                      >
                      </a>
                    </Fragment>
                  </div>
                </div>
              </th>
              <th>
                <div className="d-flex align-items-center">
                  <div className="mr-2">
                    {t('Name')}
                  </div>
                  <div className="d-flex flex-column text-center">
                    <Fragment>
                      <a
                        className={`fa ${(
                          adminUsersContainer.state.sort === 'name')
                          && (adminUsersContainer.state.sortOrder === 'asc') ? 'fa-chevron-up' : 'fa-angle-up'}`}
                        aria-hidden="true"
                        onClick={() => adminUsersContainer.onClickSortAsc('name')}
                      >
                      </a>
                      <a
                        className={`fa ${(
                          adminUsersContainer.state.sort === 'name')
                          && (adminUsersContainer.state.sortOrder === 'desc') ? 'fa-chevron-down' : 'fa-angle-down'}`}
                        aria-hidden="true"
                        onClick={() => adminUsersContainer.onClickSortDesc('name')}
                      >
                      </a>
                    </Fragment>
                  </div>
                </div>
              </th>
              <th>
                <div className="d-flex align-items-center">
                  <div className="mr-2">
                    {t('Email')}
                  </div>
                  <div className="d-flex flex-column text-center">
                    <Fragment>
                      <a
                        className={`fa ${(
                          adminUsersContainer.state.sort === 'email')
                          && (adminUsersContainer.state.sortOrder === 'asc') ? 'fa-chevron-up' : 'fa-angle-up'}`}
                        aria-hidden="true"
                        onClick={() => adminUsersContainer.onClickSortAsc('email')}
                      >
                      </a>
                      <a
                        className={`fa ${(
                          adminUsersContainer.state.sort === 'email')
                          && (adminUsersContainer.state.sortOrder === 'desc') ? 'fa-chevron-down' : 'fa-angle-down'}`}
                        aria-hidden="true"
                        onClick={() => adminUsersContainer.onClickSortDesc('email')}
                      >
                      </a>
                    </Fragment>
                  </div>
                </div>
              </th>
              <th width="100px">
                <div className="d-flex align-items-center">
                  <div className="mr-2">
                    {t('Created')}
                  </div>
                  <div className="d-flex flex-column text-center">
                    <Fragment>
                      <a
                        className={`fa ${(
                          adminUsersContainer.state.sort === 'createdAt')
                          && (adminUsersContainer.state.sortOrder === 'asc') ? 'fa-chevron-up' : 'fa-angle-up'}`}
                        aria-hidden="true"
                        onClick={() => adminUsersContainer.onClickSortAsc('createdAt')}
                      >
                      </a>
                      <a
                        className={`fa ${(
                          adminUsersContainer.state.sort === 'createdAt')
                          && (adminUsersContainer.state.sortOrder === 'desc') ? 'fa-chevron-down' : 'fa-angle-down'}`}
                        aria-hidden="true"
                        onClick={() => adminUsersContainer.onClickSortDesc('createdAt')}
                      >
                      </a>
                    </Fragment>
                  </div>
                </div>
              </th>
              <th width="150px">
                <div className="d-flex align-items-center">
                  <div className="mr-2">
                    {t('Last_Login')}
                  </div>
                  <div className="d-flex flex-column text-center">
                    <Fragment>
                      <a
                        className={`fa ${(
                          adminUsersContainer.state.sort === 'lastLoginAt')
                          && (adminUsersContainer.state.sortOrder === 'asc') ? 'fa-chevron-up' : 'fa-angle-up'}`}
                        aria-hidden="true"
                        onClick={() => adminUsersContainer.onClickSortAsc('lastLoginAt')}
                      >
                      </a>
                      <a
                        className={`fa ${(
                          adminUsersContainer.state.sort === 'lastLoginAt')
                          && (adminUsersContainer.state.sortOrder === 'desc') ? 'fa-chevron-down' : 'fa-angle-down'}`}
                        aria-hidden="true"
                        onClick={() => adminUsersContainer.onClickSortDesc('lastLoginAt')}
                      >
                      </a>
                    </Fragment>
                  </div>
                </div>
              </th>
              <th width="70px"></th>
            </tr>
          </thead>
          <tbody>
            {adminUsersContainer.state.users.map((user) => {
              return (
                <tr key={user._id}>
                  <td>
                    <UserPicture user={user} className="picture img-circle" />
                  </td>
                  <td>{this.getUserStatusLabel(user.status)} {this.getUserAdminLabel(user.admin)}</td>
                  <td>
                    <strong>{user.username}</strong>
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{dateFnsFormat(new Date(user.createdAt), 'yyyy-MM-dd')}</td>
                  <td>
                    {user.lastLoginAt && <span>{dateFnsFormat(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm')}</span>}
                  </td>
                  <td>
                    <UserMenu user={user} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Fragment>
    );
  }

}

const UserTableWrapper = (props) => {
  return createSubscribedElement(UserTable, props, [AppContainer, AdminUsersContainer]);
};

UserTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,

};

export default withTranslation()(UserTableWrapper);
