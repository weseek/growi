import {
  FC, useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'react-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { LDAPGroupSyncSettings } from '~/interfaces/external-user-group';
import { useSWRxLDAPGroupSyncSettings } from '~/stores/external-user-group';

export const LDAPGroupSyncSettingsForm: FC = () => {
  const { t } = useTranslation('admin');

  const { data: ldapGroupSyncSettings } = useSWRxLDAPGroupSyncSettings();

  const [formValues, setFormValues] = useState<LDAPGroupSyncSettings>({
    ldapGroupsDN: '',
    ldapGroupMembershipAttribute: '',
    ldapGroupMembershipAttributeType: '',
    ldapGroupChildGroupAttribute: '',
    autoGenerateUserOnLDAPGroupSync: false,
    preserveDeletedLDAPGroups: false,
    ldapGroupNameAttribute: '',
    ldapGroupDescriptionAttribute: '',
  });

  useEffect(() => {
    if (ldapGroupSyncSettings != null) {
      setFormValues(ldapGroupSyncSettings);
    }
  }, [ldapGroupSyncSettings, setFormValues]);

  const submitHandler = useCallback(async() => {
    try {
      await apiv3Put('/external-user-groups/ldap/sync-settings', formValues);
      toastSuccess('更新しました');
    }
    catch (err) {
      toastError(err);
    }
  }, [formValues]);

  return <>
    <h3 className="border-bottom">LDAP グループ同期設定</h3>
    <div className="row form-group">
      <label htmlFor="ldapGroupsDN" className="text-left text-md-right col-md-3 col-form-label">グループ検索ベース DN</label>
      <div className="col-md-6">
        <input
          className="form-control"
          type="text"
          name="ldapGroupsDN"
          id="ldapGroupsDN"
          value={formValues.ldapGroupsDN}
          onChange={e => setFormValues({ ...formValues, ldapGroupsDN: e.target.value })}
        />
        <p className="form-text text-muted">
          <small>グループ検索をするベース DN</small>
        </p>
      </div>
    </div>
    <div className="row form-group">
      <label htmlFor="ldapGroupMembershipAttribute" className="text-left text-md-right col-md-3 col-form-label">所属メンバーを表す LDAP 属性</label>
      <div className="col-md-6">
        <input
          className="form-control"
          type="text"
          name="ldapGroupMembershipAttribute"
          id="ldapGroupMembershipAttribute"
          value={formValues.ldapGroupMembershipAttribute}
          onChange={e => setFormValues({ ...formValues, ldapGroupMembershipAttribute: e.target.value })}
        />
        <p className="form-text text-muted">
          <small>
            グループの所属メンバーを表すグループオブジェクトの属性 <br />
            e.g.) <code>member</code>, <code>memberUid</code>
          </small>
        </p>
      </div>
    </div>
    <div className="row form-group">
      <label htmlFor="ldapGroupMembershipAttributeType" className="text-left text-md-right col-md-3 col-form-label">
        「所属メンバーを表す LDAP 属性」値の種類
      </label>
      <div className="col-md-6">
        <select
          className="form-control"
          name="ldapGroupMembershipAttributeType"
          id="ldapGroupMembershipAttributeType"
          value={formValues.ldapGroupMembershipAttributeType}
          onChange={e => setFormValues({ ...formValues, ldapGroupMembershipAttributeType: e.target.value })}>
          <option value="DN">DN</option>
          <option value="UID">UID</option>
        </select>
        <p className="form-text text-muted">
          <small>
          グループの所属メンバーを表すグループオブジェクトの属性値は DN か UID か
          </small>
        </p>
      </div>
    </div>
    <div className="row form-group">
      <label htmlFor="ldapGroupChildGroupAttribute" className="text-left text-md-right col-md-3 col-form-label">子グループを表す LDAP 属性</label>
      <div className="col-md-6">
        <input
          className="form-control"
          type="text"
          name="ldapGroupChildGroupAttribute"
          id="ldapGroupChildGroupAttribute"
          value={formValues.ldapGroupChildGroupAttribute}
          onChange={e => setFormValues({ ...formValues, ldapGroupChildGroupAttribute: e.target.value })}/>
        <p className="form-text text-muted">
          <small>
            グループに所属する子グループを表すグループオブジェクトの属性。属性値は DN である必要があります。<br />
            e.g.) <code>member</code>
          </small>
        </p>
      </div>
    </div>
    <div className="row form-group">
      <label
        className="text-left text-md-right col-md-3 col-form-label"
      >
        {/* {t('admin:app_setting.file_uploading')} */}
      </label>
      <div className="col-md-6">
        <div className="custom-control custom-checkbox custom-checkbox-info">
          <input
            type="checkbox"
            className="custom-control-input"
            name="autoGenerateUserOnLDAPGroupSync"
            id="autoGenerateUserOnLDAPGroupSync"
            checked={formValues.autoGenerateUserOnLDAPGroupSync}
            onChange={() => setFormValues({ ...formValues, autoGenerateUserOnLDAPGroupSync: !formValues.autoGenerateUserOnLDAPGroupSync })}
          />
          <label
            className="custom-control-label"
            htmlFor="autoGenerateUserOnLDAPGroupSync"
          >
            作成されていない GROWI アカウントを自動生成する
          </label>
        </div>
      </div>
    </div>
    <div className="row form-group">
      <label
        className="text-left text-md-right col-md-3 col-form-label"
      >
        {/* {t('admin:app_setting.file_uploading')} */}
      </label>
      <div className="col-md-6">
        <div className="custom-control custom-checkbox custom-checkbox-info">
          <input
            type="checkbox"
            className="custom-control-input"
            name="preserveDeletedLDAPGroups"
            id="preserveDeletedLDAPGroups"
            checked={formValues.preserveDeletedLDAPGroups}
            onChange={() => setFormValues({ ...formValues, preserveDeletedLDAPGroups: !formValues.preserveDeletedLDAPGroups })}
          />
          <label
            className="custom-control-label"
            htmlFor="preserveDeletedLDAPGroups"
          >
            LDAP から削除されたグループを GROWI に残す
          </label>
        </div>
      </div>
    </div>
    <h3 className="border-bottom">Attribute Mapping(オプション)</h3>
    <div className="row form-group">
      <label htmlFor="ldapGroupNameAttribute" className="text-left text-md-right col-md-3 col-form-label">名前</label>
      <div className="col-md-6">
        <input
          className="form-control"
          type="text"
          name="ldapGroupNameAttribute"
          id="ldapGroupNameAttribute"
          value={formValues.ldapGroupNameAttribute}
          onChange={e => setFormValues({ ...formValues, ldapGroupNameAttribute: e.target.value })}
          placeholder="Default: cn"
        />
        <p className="form-text text-muted">
          <small>
            グループの「名前」として読み込む属性
          </small>
        </p>
      </div>
    </div>
    <div className="row form-group">
      <label htmlFor="ldapGroupDescriptionAttribute" className="text-left text-md-right col-md-3 col-form-label">
        説明
      </label>
      <div className="col-md-6">
        <input
          className="form-control"
          type="text"
          name="ldapGroupDescriptionAttribute"
          id="ldapGroupDescriptionAttribute"
          value={formValues.ldapGroupDescriptionAttribute}
          onChange={e => setFormValues({ ...formValues, ldapGroupDescriptionAttribute: e.target.value })}
        />
        <p className="form-text text-muted">
          <small>
            グループの「説明」として読み込む属性。「説明」は同期後に編集可能です。ただし、mapper が設定されている場合、編集内容は再同期によって上書きされます。
          </small>
        </p>
      </div>
    </div>

    <div className="row my-3">
      <div className="offset-3 col-5">
        <button
          type="button"
          className="btn btn-primary"
          onClick={submitHandler}
        >
          {t('Update')}
        </button>
      </div>
    </div>
  </>;
};
