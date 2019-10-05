import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UsersContainer from '../../../services/UsersContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class UserRemoveButton extends React.Component {

  constructor(props) {
    super(props);

    this.onClickDeleteBtn = this.onClickDeleteBtn.bind(this);
  }

  async onClickDeleteBtn() {
    try {
      const username = await this.props.usersContainer.removeUser(this.props.user._id);
      toastSuccess(`Delete ${username} success`);
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <a className="px-4" onClick={() => { this.onClickDeleteBtn() }}>
        <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
      </a>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const UserRemoveButtonWrapper = (props) => {
  return createSubscribedElement(UserRemoveButton, props, [AppContainer, UsersContainer]);
};

UserRemoveButton.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  usersContainer: PropTypes.instanceOf(UsersContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(UserRemoveButtonWrapper);
