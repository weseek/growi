import {
  FC, useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'react-i18next';

import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';

import { LdapGroupSyncSettingsForm } from './LdapGroupSyncSettingsForm';

export const LdapGroupManagement: FC = () => {
  const [isUserBind, setIsUserBind] = useState(false);
  const { t } = useTranslation('admin');

  useEffect(() => {
    const getIsUserBind = async() => {
      try {
        const response = await apiv3Get('/security-setting/');
        const { ldapAuth } = response.data.securityParams;
        setIsUserBind(ldapAuth.isUserBind);
      }
      catch (e) {
        toastError(e);
      }
    };
    getIsUserBind();
  }, []);

  const onSyncBtnClick = useCallback(async(e) => {
    e.preventDefault();
    try {
      if (isUserBind) {
        const password = e.target.password.value;
        await apiv3Put('/external-user-groups/ldap/sync', { password });
      }
      else {
        await apiv3Put('/external-user-groups/ldap/sync');
      }
      toastSuccess(t('external_user_group.sync_succeeded'));
    }
    catch (errs) {
      toastError(t(errs[0]?.message));
    }
  }, [t, isUserBind]);

  return (
    <>
      <LdapGroupSyncSettingsForm />
      <h3 className="border-bottom mb-3">{t('external_user_group.execute_sync')}</h3>
      <form onSubmit={onSyncBtnClick}>
        {isUserBind && (
          <div className="row form-group">
            <label htmlFor="ldapGroupSyncPassword" className="text-left text-md-right col-md-3 col-form-label">{t('external_user_group.ldap.password')}</label>
            <div className="col-md-6">
              <input
                className="form-control"
                type="password"
                name="password"
                id="ldapGroupSyncPassword"
              />
              <p className="form-text text-muted">
                <small>{t('external_user_group.ldap.password_detail')}</small>
              </p>
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-md-3"></div>
          <div className="col-md-6"><button className="btn btn-primary" type="submit">{t('external_user_group.sync')}</button></div>
        </div>
      </form>
    </>
  );
};
