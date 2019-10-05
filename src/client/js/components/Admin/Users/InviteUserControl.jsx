import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UsersContainer from '../../../services/UsersContainer';
import UserInviteModal from './UserInviteModal';

class InviteUserControl extends React.Component {

  render() {
    const { t, usersContainer } = this.props;

    return (
      <Fragment>
        <button type="button" className="btn btn-default" onClick={usersContainer.toggleUserInviteModal}>
          { t('user_management.invite_users') }
        </button>
        <UserInviteModal />
      </Fragment>
    );
  }

}

const InviteUserControlWrapper = (props) => {
  return createSubscribedElement(InviteUserControl, props, [AppContainer, UsersContainer]);
};

InviteUserControl.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  usersContainer: PropTypes.instanceOf(UsersContainer).isRequired,
};

export default withTranslation()(InviteUserControlWrapper);
