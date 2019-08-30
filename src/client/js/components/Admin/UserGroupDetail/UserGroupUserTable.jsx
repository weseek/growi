import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

import UserGroupUserModal from './UserGroupUserModal';
import UserPicture from '../../User/UserPicture';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserGroupUserTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isUserGroupUserModalOpen: false,
    };

    this.openUserGroupUserModal = this.openUserGroupUserModal.bind(this);
    this.closeUserGroupUserModal = this.closeUserGroupUserModal.bind(this);
  }

  openUserGroupUserModal() {
    this.setState({ isUserGroupUserModalOpen: true });
  }

  closeUserGroupUserModal() {
    this.setState({ isUserGroupUserModalOpen: false });
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <legend className="m-t-20">{ t('User List') }</legend>

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
                        <form id="form_removeFromGroup_{{ loop.index }}" action="/admin/user-group-relation/{{userGroup._id.toString()}}/remove-relation/{{ sRelation._id.toString() }}" method="post">
                          <input type="hidden" name="_csrf" value="{{ csrf() }}" />
                        </form>
                        <li>
                          <a href="javascript:form_removeFromGroup_{{ loop.index }}.submit()">
                            <i className="icon-fw icon-user-unfollow"></i> { t('user_group_management.remove_from_group')}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              );
            })}

            {this.props.userGroupRelations.length === 0 ? (
              <tr>
                <td></td>
                <td className="text-center">
                  <button className="btn btn-default" type="button" onClick={this.openUserGroupUserModal}>
                    <i className="ti-plus"></i>
                  </button>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ) : null}

          </tbody>
        </table>

        <UserGroupUserModal
          show={this.state.isUserGroupUserModalOpen}
          handleClose={this.closeUserGroupUserModal}
          notRelatedUsers={this.props.notRelatedUsers}
          userGroup={this.props.userGroup}
        />

      </Fragment>
    );
  }

}

UserGroupUserTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  userGroupRelations: PropTypes.arrayOf(PropTypes.object).isRequired,
  notRelatedUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
  userGroup: PropTypes.object.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupUserTableWrapper = (props) => {
  return createSubscribedElement(UserGroupUserTable, props, [AppContainer]);
};

export default withTranslation()(UserGroupUserTableWrapper);
