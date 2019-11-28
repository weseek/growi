/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminSamlSecurityContainer from '../../../services/AdminSamlSecurityContainer';


class SamlSecurityManagement extends React.Component {

  render() {
    const { t, adminGeneralSecurityContainer, adminSamlSecurityContainer } = this.props;
    const { useOnlyEnvVars } = adminSamlSecurityContainer.state;

    return (
      <React.Fragment>

        {useOnlyEnvVars && (
        <p
          className="alert alert-info"
          dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.note for the only env option', { env: 'SAML_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS' }) }}
        />
        )}

        <div className="row mb-5">
          <strong className="col-xs-3 text-right">{ t('security_setting.SAML.name') }</strong>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isSamlEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isSamlEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsSamlEnabled() }}
              />
              <label htmlFor="isSamlEnabled">
                { t('security_setting.SAML.enable_saml') }
              </label>
            </div>
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-xs-3 text-right">{ t('security_setting.callback_URL') }</label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="text"
              value={adminSamlSecurityContainer.state.callbackUrl}
              readOnly
            />
            <p className="help-block small">{ t('security_setting.desc_of_callback_URL', { AuthName: 'SAML Identity' }) }</p>
            {!adminSamlSecurityContainer.state.appSiteUrl && (
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

        {adminGeneralSecurityContainer.state.isSamlEnabled && (
          <React.Fragment>

            {(adminSamlSecurityContainer.state.missingMandatoryConfigKeys.length !== 0) && (
            <div className="alert alert-danger">
              { t('security_setting.missing mandatory configs') }
              <ul>
                {/* TODO GW-583 show li after fetch data */}
                {/* <li>{ t('security_setting.form_item_name.key') }</li> */}
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
                  <th>{ t('security_setting.form_item_name.entryPoint') }</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      name="samlDbEntryPoint"
                      readOnly={useOnlyEnvVars}
                      value={adminSamlSecurityContainer.state.samlDbEntryPoint}
                      onChange={e => adminSamlSecurityContainer.changeSamlDbEntryPoint(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={adminSamlSecurityContainer.state.samlEnvVarEntryPoint}
                      readOnly
                    />
                    <p className="help-block">
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.Use env var if empty', { env: 'SAML_ENTRY_POINT' }) }} />
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{ t('security_setting.form_item_name.issuer') }</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      name="samlEnvVarissuer"
                      readOnly={useOnlyEnvVars}
                      value={adminSamlSecurityContainer.state.samlDbIssuer}
                      onChange={e => adminSamlSecurityContainer.changeSamlDbIssuer(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={adminSamlSecurityContainer.state.samlEnvVarIssuer}
                      readOnly
                    />
                    <p className="help-block">
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.Use env var if empty', { env: 'SAML_ISSUER' }) }} />
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{ t('security_setting.form_item_name.cert') }</th>
                  <td>
                    <textarea
                      className="form-control input-sm"
                      type="text"
                      rows="5"
                      name="samlDbCert"
                      readOnly={useOnlyEnvVars}
                      value={adminSamlSecurityContainer.state.samlDbcert}
                      onChange={e => adminSamlSecurityContainer.changeSamlDbCert(e.target.value)}
                    />
                    <p className="help-block">
                      <small>
                        { t('security_setting.SAML.cert_detail') }
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
                      value={adminSamlSecurityContainer.state.samlEnvVarCert}
                    />
                    <p className="help-block">
                      <small dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.Use env var if empty', { env: 'SAML_CERT' }) }} />
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* TODO GW-635 Attribute Mapping */}

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
