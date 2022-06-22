import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

import { withUnstatedContainers } from '../../UnstatedUtils';

class GiveAdminButton extends React.Component {

  constructor(props) {
    super(props);

    this.onClickGiveAdminBtn = this.onClickGiveAdminBtn.bind(this);
  }

  async onClickGiveAdminBtn() {
    const { t } = this.props;

    try {
      const username = await this.props.adminUsersContainer.giveUserAdmin(this.props.user._id);
      toastSuccess(t('toaster.give_user_admin', { username }));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <button className="dropdown-item" type="button" onClick={() => { this.onClickGiveAdminBtn() }}>
        <i className="icon-fw icon-user-following"></i> {t('admin:user_management.user_table.give_admin_access')}
      </button>
    );
  }

}

const GiveAdminButtonWrapperFC = (props) => {
  const { t } = useTranslation();
  return <GiveAdminButton t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const GiveAdminButtonWrapper = withUnstatedContainers(GiveAdminButtonWrapperFC, [AppContainer, AdminUsersContainer]);

GiveAdminButton.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default GiveAdminButtonWrapper;
