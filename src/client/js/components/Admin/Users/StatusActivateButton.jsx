import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminUsersContainer from '../../../services/AdminUsersContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class StatusActivateButton extends React.Component {

  constructor(props) {
    super(props);

    this.onClickAcceptBtn = this.onClickAcceptBtn.bind(this);
  }

  async onClickAcceptBtn() {
    const { t } = this.props;

    try {
      await this.props.adminUsersContainer.activateUser(this.props.user._id);
      toastSuccess(t('user_management.activate_user_success'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <a className="px-4" onClick={() => { this.onClickAcceptBtn() }}>
        <i className="icon-fw icon-user-following"></i> { t('user_management.accept') }
      </a>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const StatusActivateFormWrapper = (props) => {
  return createSubscribedElement(StatusActivateButton, props, [AppContainer, AdminUsersContainer]);
};

StatusActivateButton.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(StatusActivateFormWrapper);
