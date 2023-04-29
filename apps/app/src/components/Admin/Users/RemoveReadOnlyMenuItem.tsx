import React, { useCallback } from 'react';

import type { IUserHasId } from '@growi/core';
import { useTranslation } from 'next-i18next';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';

import { withUnstatedContainers } from '../../UnstatedUtils';

const RemoveReadOnlyMenuItem: React.FC<{
  adminUsersContainer: AdminUsersContainer,
  user: IUserHasId,
}> = ({ adminUsersContainer, user }): JSX.Element => {
  const { t } = useTranslation('admin');

  const clickRemoveReadOnlyBtnHandler = useCallback(async() => {
    try {
      const username = await adminUsersContainer.removeUserReadOnly(user._id);
      toastSuccess(t('toaster.remove_user_read_only', { username }));
    }
    catch (err) {
      toastError(err);
    }
  }, [adminUsersContainer, t, user._id]);

  return (
    <button className="dropdown-item" type="button" onClick={clickRemoveReadOnlyBtnHandler}>
      <i className="icon-fw icon-user-unfollow"></i> {t('user_management.user_table.remove_read_only_access')}
    </button>
  );
};

/**
* Wrapper component for using unstated
*/
// eslint-disable-next-line max-len
const RemoveReadOnlyMenuItemWrapper: React.ForwardRefExoticComponent<Pick<any, string | number | symbol> & React.RefAttributes<any>> = withUnstatedContainers(RemoveReadOnlyMenuItem, [AdminUsersContainer]);

export default RemoveReadOnlyMenuItemWrapper;
