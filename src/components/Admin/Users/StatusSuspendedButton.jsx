import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useCurrentUser } from '~/stores/context';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import AdminUsersContainer from '../../../services/AdminUsersContainer';

const StatusSuspendedButton = (props) => {
  const { t, user } = props;

  const onClickDeactiveBtn = async() => {
    try {
      const username = await this.props.adminUsersContainer.deactivateUser(this.props.user._id);
      toastSuccess(t('toaster.deactivate_user_success', { username }));
    }
    catch (err) {
      toastError(err);
    }
  };

  const renderSuspendedBtn = () => {
    return (
      <button className="dropdown-item" type="button" onClick={() => { onClickDeactiveBtn() }}>
        <i className="icon-fw icon-ban"></i> {t('admin:user_management.user_table.deactivate_account')}
      </button>
    );
  };

  const renderSuspendedAlert = () => {
    return (
      <div className="px-4">
        <i className="icon-fw icon-ban mb-2"></i>{t('admin:user_management.user_table.deactivate_account')}
        <p className="alert alert-danger">{t('admin:user_management.user_table.your_own')}</p>
      </div>
    );
  };

  return (
    <>
      {user.username !== useCurrentUser ? renderSuspendedBtn(): renderSuspendedAlert()}
    </>
  );
};

/**
 * Wrapper component for using unstated
 */
const StatusSuspendedFormWrapper = withUnstatedContainers(StatusSuspendedButton, [AdminUsersContainer]);

StatusSuspendedButton.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(StatusSuspendedFormWrapper);
