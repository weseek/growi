import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/es/Modal';

import UserGroupUserFormByInput from './UserGroupUserFormByInput';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserGroupUserModal extends React.Component {

  constructor(props) {
    super(props);

    this.xss = window.xss;

    this.addUserByClick = this.addUserByClick.bind(this);
    this.addUserByUsername = this.addUserByUsername.bind(this);
  }

  async addUserByClick(username) {
    const { user, userGroup, userGroupRelation } = await this.addUser(username);

    this.handlePostAdd(user, userGroup, userGroupRelation);
  }

  async addUserByUsername(username) {
    try {
      const res = await this.props.appContainer.apiv3.post(`/user-groups/${this.props.userGroup._id}/users/${username}`);
      const { user, userGroup, userGroupRelation } = res.data;
      this.props.onAdd(user, userGroup, userGroupRelation);
    }
    catch (err) {
      toastError(new Error(`Unable to add "${this.xss.process(username)}" to "${this.xss.process(this.props.userGroup.name)}"`));
    }
  }

  render() {
    const { t } = this.props;

    return (
      <Modal show={this.props.show} onHide={this.props.onClose}>
        <Modal.Header closeButton>
          <Modal.Title>{ t('user_group_management.add_user') }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>{ t('Method') }1.</strong> { t('user_group_management.how_to_add1') }
          </p>
          <UserGroupUserFormByInput
            addUserByUsername={this.addUserByUsername}
            onAdd={this.props.onAdd}
            onClose={this.props.onClose}
          />
          <hr />
          <p>
            <strong>{ t('Method') }2.</strong> { t('user_group_management.how_to_add2') }
          </p>

          <ul className="list-inline">
            {this.props.notRelatedUsers.map((user) => {
              return (
                <li key={user._id}>
                  <button type="submit" className="btn btn-xs btn-primary" onClick={() => { return this.addUserByClick(user.username) }}>
                    {user.username}
                  </button>
                </li>
              );
            })}
          </ul>

          {this.props.notRelatedUsers.length === 0 ? (
            <Fragment>
              No users available.
            </Fragment>
          ) : null}
        </Modal.Body>
      </Modal>
    );
  }

}

UserGroupUserModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  userGroup: PropTypes.object.isRequired,
  notRelatedUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupUserModalWrapper = (props) => {
  return createSubscribedElement(UserGroupUserModal, props, [AppContainer]);
};

export default withTranslation()(UserGroupUserModalWrapper);
