import { FC, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';

import { KeycloakGroupSyncSettingsForm } from './KeycloakGroupSyncSettingsForm';

export const KeycloakGroupManagement: FC = () => {
  const { t } = useTranslation('admin');

  const onSyncBtnClick = useCallback(async(e) => {
    e.preventDefault();
    try {
      await apiv3Put('/external-user-groups/keycloak/sync');
      toastSuccess(t('external_user_group.sync_succeeded'));
    }
    catch (errs) {
      toastError(t(errs[0]?.message));
    }
  }, [t]);

  return (
    <>
      <KeycloakGroupSyncSettingsForm />
      <h3 className="border-bottom mb-3">{t('external_user_group.execute_sync')}</h3>
      <form onSubmit={onSyncBtnClick}>
        <div className="row">
          <div className="col-md-3"></div>
          <div className="col-md-6"><button className="btn btn-primary" type="submit">{t('external_user_group.sync')}</button></div>
        </div>
      </form>
    </>
  );
};
