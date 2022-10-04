import React, { Fragment } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

import { withUnstatedContainers } from '../../UnstatedUtils';

class StatusSuspendedButton extends React.Component {

  constructor(props) {
    super(props);

    this.onClickDeactiveBtn = this.onClickDeactiveBtn.bind(this);
  }

  async onClickDeactiveBtn() {
    const { t } = this.props;

    try {
      const username = await this.props.adminUsersContainer.deactivateUser(this.props.user._id);
      toastSuccess(t('toaster.deactivate_user_success', { username }));
    }
    catch (err) {
      toastError(err);
    }
  }

  renderSuspendedBtn() {
    const { t } = this.props;

    return (
      <button className="dropdown-item" type="button" onClick={() => { this.onClickDeactiveBtn() }}>
        <i className="icon-fw icon-ban"></i> {t('admin:user_management.user_table.deactivate_account')}
      </button>
    );
  }

  renderSuspendedAlert() {
    const { t } = this.props;

    return (
      <div className="px-4">
        <i className="icon-fw icon-ban mb-2"></i>{t('admin:user_management.user_table.deactivate_account')}
        <p className="alert alert-danger">{t('admin:user_management.user_table.your_own')}</p>
      </div>
    );
  }

  render() {
    const { user } = this.props;
    const { currentUsername } = this.props.appContainer;

    return (
      <Fragment>
        {user.username !== currentUsername ? this.renderSuspendedBtn()
          : this.renderSuspendedAlert()}
      </Fragment>
    );
  }

}

const StatusSuspendedFormWrapperFC = (props) => {
  const { t } = useTranslation();
  return <StatusSuspendedButton t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const StatusSuspendedFormWrapper = withUnstatedContainers(StatusSuspendedFormWrapperFC, [AppContainer, AdminUsersContainer]);

StatusSuspendedButton.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default StatusSuspendedFormWrapper;
