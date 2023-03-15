import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';

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
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,

  user: PropTypes.object.isRequired,
};

const UserRemoveButtonWrapperFC = (props) => {
  const { t } = useTranslation('admin');
  return <UserRemoveButton t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const UserRemoveButtonWrapper = withUnstatedContainers(UserRemoveButtonWrapperFC, [AdminUsersContainer]);

export default UserRemoveButtonWrapper;
