import React, { Fragment } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

import { withUnstatedContainers } from '../../UnstatedUtils';

class RemoveAdminButton extends React.Component {

  constructor(props) {
    super(props);

    this.onClickRemoveAdminBtn = this.onClickRemoveAdminBtn.bind(this);
  }

  async onClickRemoveAdminBtn() {
    const { t } = this.props;

    try {
      const username = await this.props.adminUsersContainer.removeUserAdmin(this.props.user._id);
      toastSuccess(t('toaster.remove_user_admin', { username }));
    }
    catch (err) {
      toastError(err);
    }
  }


  renderRemoveAdminBtn() {
    const { t } = this.props;

    return (
      <button className="dropdown-item" type="button" onClick={() => { this.onClickRemoveAdminBtn() }}>
        <i className="icon-fw icon-user-unfollow"></i> {t('admin:user_management.user_table.remove_admin_access')}
      </button>
    );
  }

  renderRemoveAdminAlert() {
    const { t } = this.props;

    return (
      <div className="px-4">
        <i className="icon-fw icon-user-unfollow mb-2"></i>{t('admin:user_management.user_table.remove_admin_access')}
        <p className="alert alert-danger">{t('admin:user_management.user_table.cannot_remove')}</p>
      </div>
    );
  }

  render() {
    const { user } = this.props;
    const { currentUsername } = this.props.appContainer;

    return (
      <Fragment>
        {user.username !== currentUsername ? this.renderRemoveAdminBtn()
          : this.renderRemoveAdminAlert()}
      </Fragment>
    );
  }

}

const RemoveAdminButtonWrapperFC = (props) => {
  const { t } = useTranslation();
  return <RemoveAdminButton t={t} {...props} />;
};

/**
* Wrapper component for using unstated
*/
const RemoveAdminButtonWrapper = withUnstatedContainers(RemoveAdminButtonWrapperFC, [AppContainer, AdminUsersContainer]);

RemoveAdminButton.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default RemoveAdminButtonWrapper;
