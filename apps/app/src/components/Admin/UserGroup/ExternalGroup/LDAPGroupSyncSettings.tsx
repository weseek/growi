import { FC } from 'react';

export const LDAPGroupSyncSettings: FC = () => {
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
          defaultValue={''}
          onChange={() => {}}
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
          defaultValue={''}
          onChange={() => {}}
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
        <input
          className="form-control"
          type="text"
          name="ldapGroupMembershipAttributeType"
          id="ldapGroupMembershipAttributeType"
          defaultValue={''}
          onChange={() => {}}
        />
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
          defaultValue={''}
          onChange={() => {}}
        />
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
            checked={true}
            onChange={(e) => {}}
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
            checked={true}
            onChange={(e) => {}}
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
          defaultValue={''}
          onChange={() => {}}
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
          defaultValue={''}
          onChange={() => {}}
        />
        <p className="form-text text-muted">
          <small>
            グループの「説明」として読み込む属性。「説明」は同期後に編集可能です。ただし、mapper が設定されている場合、編集内容は再同期によって上書きされます。
          </small>
        </p>
      </div>
    </div>
  </>;
};
