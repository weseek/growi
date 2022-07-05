import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

import { withUnstatedContainers } from '../../UnstatedUtils';

class UserRemoveButton extends React.Component {

  constructor(props) {
    super(props);

    this.onClickDeleteBtn = this.onClickDeleteBtn.bind(this);
  }

  async onClickDeleteBtn() {
    const { t } = this.props;

    try {
      await this.props.adminUsersContainer.removeUser(this.props.user._id);
      const { username } = this.props.user;
      toastSuccess(t('toaster.remove_user_success', { username }));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <button className="dropdown-item" type="button" onClick={() => { this.onClickDeleteBtn() }}>
        <i className="icon-fw icon-fire text-danger"></i> {t('Delete')}
      </button>
    );
  }

}

UserRemoveButton.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,

  user: PropTypes.object.isRequired,
};

const UserRemoveButtonWrapperFC = (props) => {
  const { t } = useTranslation();
  return <UserRemoveButton t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const UserRemoveButtonWrapper = withUnstatedContainers(UserRemoveButtonWrapperFC, [AppContainer, AdminUsersContainer]);

export default UserRemoveButtonWrapper;
