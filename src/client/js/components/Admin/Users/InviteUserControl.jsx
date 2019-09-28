import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UserInviteModal from './UserInviteModal';
import ConfirmationPasswordModal from './ConfirmationPasswordModal';

class InviteUserControl extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isUserInviteModalShown: false,
      isConfirmationPassWordModalShown: false,
      invitedEmailList: '',
    };

    this.toggleUserInviteModal = this.toggleUserInviteModal.bind(this);
    this.showConfirmationPasswordModal = this.showConfirmationPasswordModal.bind(this);
    this.onCloseConfirmPasswordModal = this.oCloseConfirmPasswordModal.bind(this);
  }

  /**
   * user招待モーダルを開閉する
   */
  toggleUserInviteModal() {
    this.setState({ isUserInviteModalShown: !this.state.isUserInviteModalShown });
  }

  showConfirmationPasswordModal(emailList) {
    this.setState({ invitedEmailList: emailList });
    this.setState({ isConfirmationPassWordModalShown: true });
  }

  onCloseConfirmPasswordModal() {
    this.setState({ isConfirmationPassWordModalShown: false });
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <button type="button" className="btn btn-default" onClick={this.toggleUserInviteModal}>
          { t('user_management.invite_users') }
        </button>
        <UserInviteModal
          show={this.state.isUserInviteModalShown}
          onToggleModal={this.toggleUserInviteModal}
          showConfirmationPasswordModal={this.showConfirmationPasswordModal}
        />
        <ConfirmationPasswordModal
          show={this.state.isConfirmationPassWordModalShown}
          invitedEmailList={this.state.invitedEmailList}
          onCloseConfirmPasswordModal={this.onCloseConfirmPasswordModal}
        />
      </Fragment>
    );
  }

}

const InviteUserControlWrapper = (props) => {
  return createSubscribedElement(InviteUserControl, props, [AppContainer]);
};

InviteUserControl.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(InviteUserControlWrapper);
