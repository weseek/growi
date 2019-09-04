import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

import UserPicture from '../../User/UserPicture';

class UserGroupUserTable extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <table className="table table-bordered table-user-list">
        <thead>
          <tr>
            <th width="100px">#</th>
            <th>
              { t('User') }
            </th>
            <th>{ t('Name') }</th>
            <th width="100px">{ t('Created') }</th>
            <th width="160px">{ t('Last Login')}</th>
            <th width="70px"></th>
          </tr>
        </thead>
        <tbody>
          {this.props.userGroupRelations.map((sRelation) => {
              const { relatedUser } = sRelation;

              return (
                <tr key={sRelation._id}>
                  <td>
                    <UserPicture user={relatedUser} className="picture img-circle" />
                  </td>
                  <td>
                    <strong>{relatedUser.username}</strong>
                  </td>
                  <td>{relatedUser.name}</td>
                  <td>{relatedUser.createdAt ? dateFnsFormat(new Date(relatedUser.createdAt), 'yyyy-MM-dd') : ''}</td>
                  <td>{relatedUser.lastLoginAt ? dateFnsFormat(new Date(relatedUser.lastLoginAt), 'yyyy-MM-dd HH:mm:ss') : ''}</td>
                  <td>
                    <div className="btn-group admin-user-menu">
                      <button type="button" className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
                        <i className="icon-settings"></i> <span className="caret"></span>
                      </button>
                      <ul className="dropdown-menu" role="menu">
                        <li>
                          <a onClick={() => { return this.props.removeUser(relatedUser.username) }}>
                            <i className="icon-fw icon-user-unfollow"></i> { t('user_group_management.remove_from_group')}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              );
            })}

          <tr>
            <td></td>
            <td className="text-center">
              <button className="btn btn-default" type="button" onClick={this.props.openUserGroupUserModal}>
                <i className="ti-plus"></i>
              </button>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>

        </tbody>
      </table>
    );
  }

}

UserGroupUserTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  userGroupRelations: PropTypes.arrayOf(PropTypes.object).isRequired,
  openUserGroupUserModal: PropTypes.func.isRequired,
  removeUser: PropTypes.func.isRequired,
};

export default withTranslation()(UserGroupUserTable);
