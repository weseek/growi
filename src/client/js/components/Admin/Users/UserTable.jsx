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
   * user.statusをみてステータスのラベルを返す
   * @param {string} userStatus
   * @return ステータスラベル
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

  render() {
    const { t, adminUsersContainer } = this.props;

    return (
      <Fragment>
        <h2>{ t('User_Management') }</h2>

        <table className="table table-default table-bordered table-user-list">
          <thead>
            <tr>
              <th width="100px">#</th>
              <th>{ t('status') }</th>
              <th><code>{ t('User') }</code></th>
              <th>{ t('Name') }</th>
              <th>{ t('Email') }</th>
              <th width="100px">{ t('Created') }</th>
              <th width="150px">{ t('Last_Login') }</th>
              <th width="70px"></th>
            </tr>
          </thead>
          <tbody>
            {adminUsersContainer.state.users.map((user) => {
              return (
                <tr key={user._id}>
                  <td>
                    <UserPicture user={user} className="picture img-circle" />
                    {user.admin && <span className="label label-inverse label-admin ml-2">{ t('administrator') }</span>}
                  </td>
                  <td>{this.getUserStatusLabel(user.status)}</td>
                  <td>
                    <strong>{user.username}</strong>
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{dateFnsFormat(new Date(user.createdAt), 'yyyy-MM-dd')}</td>
                  <td>
                    { user.lastLoginAt && <span>{dateFnsFormat(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm')}</span> }
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
