import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UserInviteModal from './UserInviteModal';
import ConfirmPasswordModal from './ConfirmPasswordModal';

class InviteUserControl extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isUserInviteModalShown: false,
      isConfirmPassWordModalShown: false,
      invitedEmailList: null,
    };

    this.toggleUserInviteModal = this.toggleUserInviteModal.bind(this);
    this.showConfirmPasswordModal = this.showConfirmPasswordModal.bind(this);
    this.onCloseConfirmPasswordModal = this.onCloseConfirmPasswordModal.bind(this);
  }

  /**
   * user招待モーダルを開閉する
   */
  toggleUserInviteModal() {
    this.setState({ isUserInviteModalShown: !this.state.isUserInviteModalShown });
  }

  showConfirmPasswordModal(emailList) {
    this.setState({ invitedEmailList: emailList });
    this.setState({ isConfirmPassWordModalShown: true });
  }

  onCloseConfirmPasswordModal() {
    this.setState({ isConfirmPassWordModalShown: false });
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
          showConfirmPasswordModal={this.showConfirmPasswordModal}
        />
        <ConfirmPasswordModal
          show={this.state.isConfirmPassWordModalShown}
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
