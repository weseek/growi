import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUsersContainer from '../../../services/AdminUsersContainer';
import UserInviteModal from './UserInviteModal';

class InviteUserControl extends React.Component {

  render() {
    const { t, adminUsersContainer } = this.props;

    return (
      <Fragment>
        <button type="button" className="btn btn-outline-secondary" onClick={adminUsersContainer.toggleUserInviteModal}>
          {t('admin:user_management.invite_users')}
        </button>
        <UserInviteModal />
      </Fragment>
    );
  }

}

const InviteUserControlWrapper = withUnstatedContainers(InviteUserControl, [AdminUsersContainer]);

InviteUserControl.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,
};

export default withTranslation()(InviteUserControlWrapper);
