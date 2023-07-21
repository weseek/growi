import React, { useCallback } from 'react';

import type { IUserHasId } from '@growi/core';
import { useTranslation } from 'next-i18next';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { withUnstatedContainers } from '~/components/UnstatedUtils';
import { useCurrentUser } from '~/stores/context';


const SuspendAlert = React.memo((): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="px-4">
      <i className="icon-fw icon-ban mb-2"></i>{t('admin:user_management.user_table.deactivate_account')}
      <p className="alert alert-danger">{t('admin:user_management.user_table.your_own')}</p>
    </div>
  );
});

SuspendAlert.displayName = 'SuspendAlert';

type Props = {
  adminUsersContainer: AdminUsersContainer,
  user: IUserHasId,
}

const StatusSuspendMenuItem = (props: Props): JSX.Element => {
  const { t } = useTranslation('admin');

  const { adminUsersContainer, user } = props;

  const { data: currentUser } = useCurrentUser();

  const clickDeactiveBtnHandler = useCallback(async() => {
    try {
      const username = await adminUsersContainer.deactivateUser(user._id);
      toastSuccess(t('toaster.deactivate_user_success', { username }));
    }
    catch (err) {
      toastError(err);
    }
  }, [adminUsersContainer, t, user._id]);

  return user.username !== currentUser?.username
    ? (
      <button className="dropdown-item" type="button" onClick={clickDeactiveBtnHandler}>
        <i className="icon-fw icon-ban"></i> {t('user_management.user_table.deactivate_account')}
      </button>
    )
    : <SuspendAlert />;
};

/**
 * Wrapper component for using unstated
 */
// eslint-disable-next-line max-len
const StatusSuspendMenuItemWrapper: React.ForwardRefExoticComponent<Pick<any, string | number | symbol> & React.RefAttributes<any>> = withUnstatedContainers(StatusSuspendMenuItem, [AdminUsersContainer]);

export default StatusSuspendMenuItemWrapper;
