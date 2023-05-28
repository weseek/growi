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
      toastSuccess(t('external_group.ldap.updated_group_sync_settings'));
    }
    catch (err) {
      toastError(err);
    }
  }, [formValues]);

  return <>
    <h3 className="border-bottom">{t('external_group.ldap.group_sync_settings')}</h3>
    <div className="row form-group">
      <label htmlFor="ldapGroupsDN" className="text-left text-md-right col-md-3 col-form-label">{t('external_group.ldap.group_search_base_DN')}</label>
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
          <small>{t('external_group.ldap.group_search_base_dn_detail')}</small>
        </p>
      </div>
    </div>
    <div className="row form-group">
      <label htmlFor="ldapGroupMembershipAttribute" className="text-left text-md-right col-md-3 col-form-label">
        {t('external_group.ldap.membership_attribute')}
      </label>
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
            {t('external_group.ldap.membership_attribute_detail')} <br />
            e.g.) <code>member</code>, <code>memberUid</code>
          </small>
        </p>
      </div>
    </div>
    <div className="row form-group">
      <label htmlFor="ldapGroupMembershipAttributeType" className="text-left text-md-right col-md-3 col-form-label">
        {t('external_group.ldap.membership_attribute_type')}
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
            {t('external_group.ldap.membership_attribute_type_detail')}
          </small>
        </p>
      </div>
    </div>
    <div className="row form-group">
      <label htmlFor="ldapGroupChildGroupAttribute" className="text-left text-md-right col-md-3 col-form-label">
        {t('external_group.ldap.child_group_attribute')}
      </label>
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
            {t('external_group.ldap.child_group_attribute_detail')}<br />
            e.g.) <code>member</code>
          </small>
        </p>
      </div>
    </div>
    <div className="row form-group">
      <label
        className="text-left text-md-right col-md-3 col-form-label"
      >
        {/* {t('external_group.ldap.auto_generate_user_on_sync')} */}
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
            {t('external_group.ldap.auto_generate_user_on_sync')}
          </label>
        </div>
      </div>
    </div>
    <div className="row form-group">
      <label
        className="text-left text-md-right col-md-3 col-form-label"
      >
        {/* {t('external_group.ldap.preserve_deleted_ldap_groups')} */}
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
            {t('external_group.ldap.preserve_deleted_ldap_groups')}
          </label>
        </div>
      </div>
    </div>
    <h3 className="border-bottom">Attribute Mapping ({t('optional')})</h3>
    <div className="row form-group">
      <label htmlFor="ldapGroupNameAttribute" className="text-left text-md-right col-md-3 col-form-label">{t('Name')}</label>
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
            {t('external_group.ldap.name_mapper_detail')}
          </small>
        </p>
      </div>
    </div>
    <div className="row form-group">
      <label htmlFor="ldapGroupDescriptionAttribute" className="text-left text-md-right col-md-3 col-form-label">
        {t('Description')}
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
            {t('external_group.ldap.description_mapper_detail')}
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
