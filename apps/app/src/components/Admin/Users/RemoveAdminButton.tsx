import React, { useCallback } from 'react';

import type { IUserHasId } from '@growi/core';
import { useTranslation } from 'next-i18next';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useCurrentUser } from '~/stores/context';

import { withUnstatedContainers } from '../../UnstatedUtils';

type RemoveAdminButtonProps = {
  adminUsersContainer: AdminUsersContainer,
  user: IUserHasId,
}

const RemoveAdminButton = (props: RemoveAdminButtonProps): JSX.Element => {

  const { t } = useTranslation('admin');
  const { data: currentUser } = useCurrentUser();
  const { adminUsersContainer, user } = props;

  const onClickRemoveAdminBtnHandler = useCallback(async() => {
    try {
      const username = await adminUsersContainer.revokeUserAdmin(user._id);
      toastSuccess(t('toaster.remove_user_admin', { username }));
    }
    catch (err) {
      toastError(err);
    }
  }, [adminUsersContainer, t, user._id]);

  const renderRemoveAdminBtn = () => {
    return (
      <button className="dropdown-item" type="button" onClick={() => onClickRemoveAdminBtnHandler()}>
        <i className="icon-fw icon-user-unfollow"></i>{t('user_management.user_table.remove_admin_access')}
      </button>
    );
  };

  const renderRemoveAdminAlert = () => {
    return (
      <div className="px-4">
        <i className="icon-fw icon-user-unfollow mb-2"></i>{t('user_management.user_table.remove_admin_access')}
        <p className="alert alert-danger">{t('user_management.user_table.cannot_remove')}</p>
      </div>
    );
  };

  if (currentUser == null) {
    return <></>;
  }

  return (
    <>
      {user.username !== currentUser.username ? renderRemoveAdminBtn()
        : renderRemoveAdminAlert()}
    </>
  );
};

/**
* Wrapper component for using unstated
*/
const RemoveAdminButtonWrapper = withUnstatedContainers(RemoveAdminButton, [AdminUsersContainer]);

export default RemoveAdminButtonWrapper;
