import { FC, useCallback } from 'react';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';

import { LdapGroupSyncSettingsForm } from './LdapGroupSyncSettingsForm';

export const LdapGroupManagement: FC = () => {
  const onSyncBtnClick = useCallback(async() => {
    try {
      await apiv3Put('/external-user-groups/ldap/sync');
      toastSuccess('同期に成功しました');
    }
    catch (e) {
      toastError('同期に失敗しました。LDAP による認証設定や、グループ同期設定が正しいことを確認してください。');
    }
  }, []);

  return <>
    <LdapGroupSyncSettingsForm />
    <h3 className="border-bottom mb-3">同期実行</h3>
    <div className="row">
      <div className="col-md-3"></div>
      <div className="col-md-6"><button className="btn btn-primary" onClick={onSyncBtnClick}>同期</button></div>
    </div>
  </>;
};
