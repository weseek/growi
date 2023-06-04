import {
  FC, useCallback, useEffect, useState,
} from 'react';

import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';

import { LdapGroupSyncSettingsForm } from './LdapGroupSyncSettingsForm';

export const LdapGroupManagement: FC = () => {
  const [isUserBind, setIsUserBind] = useState(false);

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
    const password = e.target.password.value;
    try {
      await apiv3Put('/external-user-groups/ldap/sync', { password });
      toastSuccess('同期に成功しました');
    }
    catch (e) {
      toastError('同期に失敗しました。LDAP による認証設定や、グループ同期設定が正しいことを確認してください。');
    }
  }, []);

  return <>
    <LdapGroupSyncSettingsForm />
    <h3 className="border-bottom mb-3">同期実行</h3>
    <form onSubmit={onSyncBtnClick}>
      {isUserBind && <div className="row form-group">
        <label htmlFor="ldapGroupSyncPassword" className="text-left text-md-right col-md-3 col-form-label">パスワード</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="password"
            name="password"
            id="ldapGroupSyncPassword"
          />
          <p className="form-text text-muted">
            <small>認証設定がユーザBind のため、ログイン時のパスワードの入力が必要となります。</small>
          </p>
        </div>
      </div>}
      <div className="row">
        <div className="col-md-3"></div>
        <div className="col-md-6"><button className="btn btn-primary" type="submit">同期</button></div>
      </div>
    </form>
  </>;
};
