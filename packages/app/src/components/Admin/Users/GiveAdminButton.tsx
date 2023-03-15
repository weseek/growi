import React, { useCallback } from 'react';

import type { IUserHasId } from '@growi/core';
import { useTranslation } from 'next-i18next';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';

import { withUnstatedContainers } from '../../UnstatedUtils';

type GiveAdminButtonProps = {
  adminUsersContainer: AdminUsersContainer,
  user: IUserHasId,
}

const GiveAdminButton = (props: GiveAdminButtonProps): JSX.Element => {

  const { t } = useTranslation('admin');
  const { adminUsersContainer, user } = props;

  const onClickGiveAdminBtnHandler = useCallback(async() => {
    try {
      const username = await adminUsersContainer.giveUserAdmin(user._id);
      toastSuccess(t('toaster.give_user_admin', { username }));
    }
    catch (err) {
      toastError(err);
    }
  }, [adminUsersContainer, t, user._id]);

  return (
    <button className="dropdown-item" type="button" onClick={() => onClickGiveAdminBtnHandler()}>
      <i className="icon-fw icon-user-following"></i> {t('user_management.user_table.give_admin_access')}
    </button>
  );

};

/**
 * Wrapper component for using unstated
 */
// eslint-disable-next-line max-len
const GiveAdminButtonWrapper: React.ForwardRefExoticComponent<Pick<any, string | number | symbol> & React.RefAttributes<any>> = withUnstatedContainers(GiveAdminButton, [AdminUsersContainer]);

export default GiveAdminButtonWrapper;
