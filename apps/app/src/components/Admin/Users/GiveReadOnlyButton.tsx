import React, { useCallback } from 'react';

import type { IUserHasId } from '@growi/core';
import { useTranslation } from 'next-i18next';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';

import { withUnstatedContainers } from '../../UnstatedUtils';

const GiveReadOnlyAlert = React.memo((): JSX.Element => {
  const { t } = useTranslation('admin');

  return (
    <div className="px-4">
      <i className="icon-fw icon-user-unfollow mb-2"></i>{t('user_management.user_table.remove_read_only_access')}
      <p className="alert alert-danger">{t('user_management.user_table.cannot_give_read_only')}</p>
    </div>
  );
});
GiveReadOnlyAlert.displayName = 'GiveReadOnlyAlert';

const GiveReadOnlyButton: React.FC<{
  adminUsersContainer: AdminUsersContainer,
  user: IUserHasId,
}> = ({ adminUsersContainer, user }): JSX.Element => {
  const { t } = useTranslation('admin');

  const onClickGiveReadOnlyBtnHandler = useCallback(async() => {
    try {
      const username = await adminUsersContainer.giveUserReadOnly(user._id);
      toastSuccess(t('toaster.give_user_read_only', { username }));
    }
    catch (err) {
      toastError(err);
    }
  }, [adminUsersContainer, t, user._id]);

  return user.admin
    ? <GiveReadOnlyAlert />
    : (
      <button className="dropdown-item" type="button" onClick={onClickGiveReadOnlyBtnHandler}>
        <i className="icon-fw icon-user-following"></i> {t('user_management.user_table.give_read_only_access')}
      </button>
    );
};

/**
 * Wrapper component for using unstated
 */
// eslint-disable-next-line max-len
const GiveReadOnlyButtonWrapper: React.ForwardRefExoticComponent<Pick<any, string | number | symbol> & React.RefAttributes<any>> = withUnstatedContainers(GiveReadOnlyButton, [AdminUsersContainer]);

export default GiveReadOnlyButtonWrapper;
