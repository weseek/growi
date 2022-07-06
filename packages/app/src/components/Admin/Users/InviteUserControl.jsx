import React, { Fragment } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import AppContainer from '~/client/services/AppContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';

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

InviteUserControl.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,
};

const InviteUserControlWrapperFC = (props) => {
  const { t } = useTranslation();
  return <InviteUserControl t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const InviteUserControlWrapper = withUnstatedContainers(InviteUserControlWrapperFC, [AppContainer, AdminUsersContainer]);

export default InviteUserControlWrapper;
