import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UserInviteModal from './UserInviteModal';

class InviteUserControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUserInviteModalShown: false,
    };

    this.toggleUserInviteModal = this.toggleUserInviteModal.bind(this);
  }

  /**
   * user招待モーダルを開閉する
   */
  toggleUserInviteModal() {
    this.setState({ isUserInviteModalShown: !this.state.isUserInviteModalShown });
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
