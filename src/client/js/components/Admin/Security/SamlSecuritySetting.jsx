/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminSamlSecurityContainer from '../../../services/AdminSamlSecurityContainer';

class SamlSecurityManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isRetrieving: true,
      envEntryPoint: '',
      envIssuer: '',
      envCert: '',
      envAttrMapId: '',
      envAttrMapUsername: '',
      envAttrMapMail: '',
      envAttrMapFirstName: '',
      envAttrMapLastName: '',
      envABLCRule: '',
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async componentDidMount() {
    const { adminSamlSecurityContainer } = this.props;

    try {
      const samlAuth = await adminSamlSecurityContainer.retrieveSecurityData();
      this.setState({
        envEntryPoint: samlAuth.samlEnvVarEntryPoint,
        envIssuer: samlAuth.samlEnvVarIssuer,
        envCert: samlAuth.samlEnvVarCert,
        envAttrMapId: samlAuth.samlEnvVarAttrMapId,
        envAttrMapUsername: samlAuth.samlEnvVarAttrMapUsername,
        envAttrMapMail: samlAuth.samlEnvVarAttrMapMail,
        envAttrMapFirstName: samlAuth.samlEnvVarAttrMapFirstName,
        envAttrMapLastName: samlAuth.samlEnvVarAttrMapLastName,
        envABLCRule: samlAuth.samlEnvVarABLCRule,
      });
    }
    catch (err) {
      toastError(err);
    }
    this.setState({ isRetrieving: false });
  }

  async onClickSubmit() {
    const { t, adminSamlSecurityContainer, adminGeneralSecurityContainer } = this.props;

    try {
      await adminSamlSecurityContainer.updateSamlSetting();
      await adminGeneralSecurityContainer.retrieveSetupStratedies();
      toastSuccess(t('security_setting.SAML.updated_saml'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminSamlSecurityContainer } = this.props;
    const { useOnlyEnvVars } = adminSamlSecurityContainer.state;
    const { isSamlEnabled } = adminGeneralSecurityContainer.state;

    if (this.state.isRetrieving) {
      return null;
    }
    return (
      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          {t('security_setting.SAML.name')}
        </h2>

        {useOnlyEnvVars && (
          <p
            className="alert alert-info"
            dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.note for the only env option', { env: 'SAML_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS' }) }}
          />
        )}

        <div className="row mb-5">
          <div className="col-xs-3 my-3 text-right">
            <strong>{t('security_setting.SAML.name')}</strong>
          </div>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isSamlEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isSamlEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsSamlEnabled() }}
              />
              <label htmlFor="isSamlEnabled">
                {t('security_setting.SAML.enable_saml')}
              </label>
            </div>
            {(!adminGeneralSecurityContainer.state.setupStrategies.includes('ldap') && isSamlEnabled)
              && <div className="label label-warning">{t('security_setting.setup_is_not_yet_complete')}</div>}
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-xs-3 text-right">{t('security_setting.callback_URL')}</label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="text"
              defaultValue={adminSamlSecurityContainer.state.callbackUrl}
              readOnly
            />
            <p className="help-block small">{t('security_setting.desc_of_callback_URL', { AuthName: 'SAML Identity' })}</p>
            {!adminGeneralSecurityContainer.state.appSiteUrl && (
              <div className="alert alert-danger">
                <i
                  className="icon-exclamation"
                  // eslint-disable-next-line max-len
                  dangerouslySetInnerHTML={{ __html: t('security_setting.alert_siteUrl_is_not_set', { link: `<a href="/admin/app">${t('App settings')}<i class="icon-login"></i></a>` }) }}
                />
              </div>
            )}
          </div>
        </div>

        {isSamlEnabled && (
          <React.Fragment>

            {(adminSamlSecurityContainer.state.missingMandatoryConfigKeys.length !== 0) && (
              <div className="alert alert-danger">
                {t('security_setting.missing mandatory configs')}
                <ul>
                  {adminSamlSecurityContainer.state.missingMandatoryConfigKeys.map((configKey) => {
                    const key = configKey.replace('security:passport-saml:', '');
                    return <li key={configKey}>{t(`security_setting.form_item_name.${key}`)}</li>;
                  })}
                </ul>
              </div>
            )}


            <h3 className="alert-anchor border-bottom">
              Basic Settings
            </h3>

            <table className={`table settings-table ${adminSamlSecurityContainer.state.useOnlyEnvVars && 'use-only-env-vars'}`}>
              <colgroup>
                <col className="item-name" />
                <col className="from-db" />
                <col className="from-env-vars" />
              </colgroup>
              <thead>
                <tr><th></th><th>Database</th><th>Environment variables</th></tr>
              </thead>
              <tbody>
                <tr>
                  <th>{t('security_setting.form_item_name.entryPoint')}</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      name="samlEntryPoint"
                      readOnly={useOnlyEnvVars}
                      defaultValue={adminSamlSecurityContainer.state.samlEntryPoint}
                      onChange={e => adminSamlSecurityContainer.changeSamlEntryPoint(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={this.state.envEntryPoint || ''}
                      readOnly
                    />
                    <p className="help-block">
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.Use env var if empty', { env: 'SAML_ENTRY_POINT' }) }} />
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{t('security_setting.form_item_name.issuer')}</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      name="samlEnvVarissuer"
                      readOnly={useOnlyEnvVars}
                      defaultValue={adminSamlSecurityContainer.state.samlIssuer}
                      onChange={e => adminSamlSecurityContainer.changeSamlIssuer(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={this.state.envIssuer || ''}
                      readOnly
                    />
                    <p className="help-block">
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.Use env var if empty', { env: 'SAML_ISSUER' }) }} />
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{t('security_setting.form_item_name.cert')}</th>
                  <td>
                    <textarea
                      className="form-control input-sm"
                      type="text"
                      rows="5"
                      name="samlCert"
                      readOnly={useOnlyEnvVars}
                      defaultValue={adminSamlSecurityContainer.state.samlCert}
                      onChange={e => adminSamlSecurityContainer.changeSamlCert(e.target.value)}
                    />
                    <p className="help-block">
                      <small>
                        {t('security_setting.SAML.cert_detail')}
                      </small>
                    </p>
                    <div>
                      <small>
                        e.g.
                        <pre>{`-----BEGIN CERTIFICATE-----
MIICBzCCAXACCQD4US7+0A/b/zANBgkqhkiG9w0BAQsFADBIMQswCQYDVQQGEwJK
UDEOMAwGA1UECAwFVG9reW8xFTATBgNVBAoMDFdFU0VFSywgSW5jLjESMBAGA1UE
...
crmVwBzbloUO2l6k1ibwD2WVwpdxMKIF5z58HfKAvxZAzCHE7kMEZr1ge30WRXQA
pWVdnzS1VCO8fKsJ7YYIr+JmHvseph3kFUOI5RqkCcMZlKUv83aUThsTHw==
-----END CERTIFICATE-----
                        `}
                        </pre>
                      </small>
                    </div>
                  </td>
                  <td>
                    <textarea
                      className="form-control input-sm"
                      type="text"
                      rows="5"
                      readOnly
                      value={this.state.envCert || ''}
                    />
                    <p className="help-block">
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.Use env var if empty', { env: 'SAML_CERT' }) }} />
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            <h3 className="alert-anchor border-bottom">
              Attribute Mapping
            </h3>

            <table className={`table settings-table ${adminSamlSecurityContainer.state.useOnlyEnvVars && 'use-only-env-vars'}`}>
              <colgroup>
                <col className="item-name" />
                <col className="from-db" />
                <col className="from-env-vars" />
              </colgroup>
              <thead>
                <tr><th></th><th>Database</th><th>Environment variables</th></tr>
              </thead>
              <tbody>
                <tr>
                  <th>{t('security_setting.form_item_name.attrMapId')}</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      readOnly={useOnlyEnvVars}
                      defaultValue={adminSamlSecurityContainer.state.samlAttrMapId}
                      onChange={e => adminSamlSecurityContainer.changeSamlAttrMapId(e.target.value)}
                    />
                    <p className="help-block">
                      <small>
                        {t('security_setting.SAML.id_detail')}
                      </small>
                    </p>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={this.state.envAttrMapId || ''}
                      readOnly
                    />
                    <p className="help-block">
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.Use env var if empty', { env: 'SAML_ATTR_MAPPING_ID' }) }} />
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{t('security_setting.form_item_name.attrMapUsername')}</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      readOnly={useOnlyEnvVars}
                      defaultValue={adminSamlSecurityContainer.state.samlAttrMapUsername}
                      onChange={e => adminSamlSecurityContainer.changeSamlAttrMapUserName(e.target.value)}
                    />
                    <p className="help-block">
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.username_detail') }} />
                    </p>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={this.state.envAttrMapUsername || ''}
                      readOnly
                    />
                    <p className="help-block">
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.Use env var if empty', { env: 'SAML_ATTR_MAPPING_USERNAME' }) }} />
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{t('security_setting.form_item_name.attrMapMail')}</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      readOnly={useOnlyEnvVars}
                      defaultValue={adminSamlSecurityContainer.state.samlAttrMapMail}
                      onChange={e => adminSamlSecurityContainer.changeSamlAttrMapMail(e.target.value)}
                    />
                    <p className="help-block">
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.mapping_detail', { target: 'Email' }) }} />
                    </p>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={this.state.envAttrMapMail || ''}
                      readOnly
                    />
                    <p className="help-block">
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.Use env var if empty', { env: 'SAML_ATTR_MAPPING_MAIL' }) }} />
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{t('security_setting.form_item_name.attrMapFirstName')}</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      readOnly={useOnlyEnvVars}
                      defaultValue={adminSamlSecurityContainer.state.samlAttrMapFirstName}
                      onChange={e => adminSamlSecurityContainer.changeSamlAttrMapFirstName(e.target.value)}
                    />
                    <p className="help-block">
                      {/* eslint-disable-next-line max-len */}
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.mapping_detail', { target: t('security_setting.form_item_name.attrMapFirstName') }) }} />
                    </p>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={this.state.envAttrMapFirstName || ''}
                      readOnly
                    />
                    <p className="help-block">
                      <small>
                        <span dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.Use env var if empty', { env: 'SAML_ATTR_MAPPING_FIRST_NAME' }) }} />
                        <br />
                        <span dangerouslySetInnerHTML={{ __html: t('security_setting.Use default if both are empty', { target: 'firstName' }) }} />
                      </small>
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{t('security_setting.form_item_name.attrMapLastName')}</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      readOnly={useOnlyEnvVars}
                      defaultValue={adminSamlSecurityContainer.state.samlAttrMapLastName}
                      onChange={e => adminSamlSecurityContainer.changeSamlAttrMapLastName(e.target.value)}
                    />
                    <p className="help-block">
                      {/* eslint-disable-next-line max-len */}
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.mapping_detail', { target: t('security_setting.form_item_name.attrMapLastName') }) }} />
                    </p>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={this.state.envAttrMapLastName || ''}
                      readOnly
                    />
                    <p className="help-block">
                      <small>
                        <span dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.Use env var if empty', { env: 'SAML_ATTR_MAPPING_LAST_NAME' }) }} />
                        <br />
                        <span dangerouslySetInnerHTML={{ __html: t('security_setting.Use default if both are empty', { target: 'lastName' }) }} />
                      </small>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            <h3 className="alert-anchor border-bottom">
              Attribute Mapping Options
            </h3>

            <div className="row mb-5">
              <div className="col-xs-offset-3 col-xs-6 text-left">
                <div className="checkbox checkbox-success">
                  <input
                    id="bindByUserName-SAML"
                    type="checkbox"
                    checked={adminSamlSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser || false}
                    onChange={() => { adminSamlSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    htmlFor="bindByUserName-SAML"
                    dangerouslySetInnerHTML={{ __html: t('security_setting.Treat username matching as identical') }}
                  />
                </div>
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Treat username matching as identical_warn') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <div className="col-xs-offset-3 col-xs-6 text-left">
                <div className="checkbox checkbox-success">
                  <input
                    id="bindByEmail-SAML"
                    type="checkbox"
                    checked={adminSamlSecurityContainer.state.isSameEmailTreatedAsIdenticalUser || false}
                    onChange={() => { adminSamlSecurityContainer.switchIsSameEmailTreatedAsIdenticalUser() }}
                  />
                  <label
                    htmlFor="bindByEmail-SAML"
                    dangerouslySetInnerHTML={{ __html: t('security_setting.Treat email matching as identical') }}
                  />
                </div>
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Treat email matching as identical_warn') }} />
                </p>
              </div>
            </div>

            <h3 className="alert-anchor border-bottom">
              Attribute-based Login Control
            </h3>

            <p className="help-block">
              <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.attr_based_login_control_detail') }} />
            </p>

            <table className="table settings-table {% if useOnlyEnvVars %}use-only-env-vars{% endif %}">
              <colgroup>
                <col className="item-name" />
                <col className="from-db" />
                <col className="from-env-vars" />
              </colgroup>
              <thead>
                <tr><th></th><th>Database</th><th>Environment variables</th></tr>
              </thead>
              <tbody>
                <tr>
                  <th>
                    { t('security_setting.form_item_name.ABLCRule') }
                  </th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      defaultValue={adminSamlSecurityContainer.state.samlABLCRule || ''}
                      onChange={(e) => { adminSamlSecurityContainer.changeSamlABLCRule(e.target.value) }}
                      readOnly={useOnlyEnvVars}
                    />
                    <p className="help-block">
                      <small>
                        <span dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.attr_based_login_control_rule_detail') }} />
                        <span dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.attr_based_login_control_rule_example') }} />
                      </small>
                    </p>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={this.state.envABLCRule || ''}
                      readOnly
                    />
                    <p className="help-block">
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.Use env var if empty', { env: 'SAML_ABLC_RULE' }) }} />
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="row my-3">
              <div className="col-xs-offset-3 col-xs-5">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={adminSamlSecurityContainer.state.retrieveError != null}
                  onClick={this.onClickSubmit}
                >
                  {t('Update')}
                </button>
              </div>
            </div>

          </React.Fragment>
        )}

      </React.Fragment>
    );

  }

}

SamlSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminSamlSecurityContainer: PropTypes.instanceOf(AdminSamlSecurityContainer).isRequired,
};

const SamlSecurityManagementWrapper = (props) => {
  return createSubscribedElement(SamlSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminSamlSecurityContainer]);
};

export default withTranslation()(SamlSecurityManagementWrapper);
