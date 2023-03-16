/* eslint-disable react/no-danger */
import React from 'react';

import { pathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import { Collapse } from 'reactstrap';
import urljoin from 'url-join';


import AdminGeneralSecurityContainer from '~/client/services/AdminGeneralSecurityContainer';
import AdminSamlSecurityContainer from '~/client/services/AdminSamlSecurityContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useSiteUrl } from '~/stores/context';

import { withUnstatedContainers } from '../../UnstatedUtils';


class SamlSecurityManagementContents extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isHelpOpened: false,
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminSamlSecurityContainer, adminGeneralSecurityContainer } = this.props;

    try {
      await adminSamlSecurityContainer.updateSamlSetting();
      await adminGeneralSecurityContainer.retrieveSetupStratedies();
      toastSuccess(t('security_settings.SAML.updated_saml'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const {
      t, adminGeneralSecurityContainer, adminSamlSecurityContainer, siteUrl,
    } = this.props;
    const { useOnlyEnvVars } = adminSamlSecurityContainer.state;
    const { isSamlEnabled } = adminGeneralSecurityContainer.state;

    const samlCallbackUrl = urljoin(pathUtils.removeTrailingSlash(siteUrl), '/passport/saml/callback');

    return (
      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          {t('security_settings.SAML.name')}
        </h2>

        {useOnlyEnvVars && (
          <p
            className="alert alert-info"
            dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.note for the only env option', { env: 'SAML_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS' }) }}
          />
        )}

        <div className="row form-group mb-5">
          <div className="col-6 offset-3">
            <div className="custom-control custom-switch custom-checkbox-success">
              <input
                id="isSamlEnabled"
                className="custom-control-input"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isSamlEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsSamlEnabled() }}
                disabled={adminSamlSecurityContainer.state.useOnlyEnvVars}
              />
              <label className="custom-control-label" htmlFor="isSamlEnabled">
                {t('security_settings.SAML.enable_saml')}
              </label>
            </div>
            {(!adminGeneralSecurityContainer.state.setupStrategies.includes('saml') && isSamlEnabled)
              && <div className="badge badge-warning">{t('security_settings.setup_is_not_yet_complete')}</div>}
          </div>
        </div>

        <div className="row form-group mb-5">
          <label className="text-left text-md-right col-md-3 col-form-label">{t('security_settings.callback_URL')}</label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              defaultValue={samlCallbackUrl}
              readOnly
            />
            <p className="form-text text-muted small">{t('security_settings.desc_of_callback_URL', { AuthName: 'SAML Identity' })}</p>
            {(siteUrl == null || siteUrl === '') && (
              <div className="alert alert-danger">
                <i
                  className="icon-exclamation"
                  // eslint-disable-next-line max-len
                  dangerouslySetInnerHTML={{ __html: t('alert.siteUrl_is_not_set', { link: `<a href="/admin/app">${t('headers.app_settings', { ns: 'commons' })}<i class="icon-login"></i></a>`, ns: 'commons' }) }}
                />
              </div>
            )}
          </div>
        </div>

        {isSamlEnabled && (
          <React.Fragment>

            {(adminSamlSecurityContainer.state.missingMandatoryConfigKeys.length !== 0) && (
              <div className="alert alert-danger">
                {t('security_settings.missing mandatory configs')}
                <ul>
                  {adminSamlSecurityContainer.state.missingMandatoryConfigKeys.map((configKey) => {
                    const key = configKey.replace('security:passport-saml:', '');
                    return <li key={configKey}>{t(`security_settings.form_item_name.${key}`)}</li>;
                  })}
                </ul>
              </div>
            )}


            <h3 className="alert-anchor border-bottom">
              Basic Settings
            </h3>

            <table className={`table settings-table ${useOnlyEnvVars && 'use-only-env-vars'}`}>
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
                  <th>{t('security_settings.form_item_name.entryPoint')}</th>
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
                      value={adminSamlSecurityContainer.state.envEntryPoint || ''}
                      readOnly
                    />
                    <p className="form-text text-muted">
                      <small dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.Use env var if empty', { env: 'SAML_ENTRY_POINT' }) }} />
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{t('security_settings.form_item_name.issuer')}</th>
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
                      value={adminSamlSecurityContainer.state.envIssuer || ''}
                      readOnly
                    />
                    <p className="form-text text-muted">
                      <small dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.Use env var if empty', { env: 'SAML_ISSUER' }) }} />
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{t('security_settings.form_item_name.cert')}</th>
                  <td>
                    <textarea
                      className="form-control form-control-sm"
                      type="text"
                      rows="5"
                      name="samlCert"
                      readOnly={useOnlyEnvVars}
                      defaultValue={adminSamlSecurityContainer.state.samlCert}
                      onChange={e => adminSamlSecurityContainer.changeSamlCert(e.target.value)}
                    />
                    <p>
                      <small>
                        {t('security_settings.SAML.cert_detail')}
                      </small>
                    </p>
                    <div>
                      <small>
                        e.g.
                        <pre className="well card">{`-----BEGIN CERTIFICATE-----
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
                      className="form-control form-control-sm"
                      type="text"
                      rows="5"
                      readOnly
                      value={adminSamlSecurityContainer.state.envCert || ''}
                    />
                    <p className="form-text text-muted">
                      <small dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.Use env var if empty', { env: 'SAML_CERT' }) }} />
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            <h3 className="alert-anchor border-bottom">
              Attribute Mapping
            </h3>

            <table className="table settings-table">
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
                  <th>{t('security_settings.form_item_name.attrMapId')}</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      defaultValue={adminSamlSecurityContainer.state.samlAttrMapId}
                      onChange={e => adminSamlSecurityContainer.changeSamlAttrMapId(e.target.value)}
                    />
                    <p className="form-text text-muted">
                      <small>
                        {t('security_settings.SAML.id_detail')}
                      </small>
                    </p>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={adminSamlSecurityContainer.state.envAttrMapId || ''}
                      readOnly
                    />
                    <p className="form-text text-muted">
                      <small dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.Use env var if empty', { env: 'SAML_ATTR_MAPPING_ID' }) }} />
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{t('security_settings.form_item_name.attrMapUsername')}</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      defaultValue={adminSamlSecurityContainer.state.samlAttrMapUsername}
                      onChange={e => adminSamlSecurityContainer.changeSamlAttrMapUserName(e.target.value)}
                    />
                    <p className="form-text text-muted">
                      <small dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.username_detail') }} />
                    </p>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={adminSamlSecurityContainer.state.envAttrMapUsername || ''}
                      readOnly
                    />
                    <p className="form-text text-muted">
                      <small dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.Use env var if empty', { env: 'SAML_ATTR_MAPPING_USERNAME' }) }} />
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{t('security_settings.form_item_name.attrMapMail')}</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      defaultValue={adminSamlSecurityContainer.state.samlAttrMapMail}
                      onChange={e => adminSamlSecurityContainer.changeSamlAttrMapMail(e.target.value)}
                    />
                    <p className="form-text text-muted">
                      <small dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.mapping_detail', { target: 'Email' }) }} />
                    </p>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={adminSamlSecurityContainer.state.envAttrMapMail || ''}
                      readOnly
                    />
                    <p className="form-text text-muted">
                      <small dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.Use env var if empty', { env: 'SAML_ATTR_MAPPING_MAIL' }) }} />
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{t('security_settings.form_item_name.attrMapFirstName')}</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      defaultValue={adminSamlSecurityContainer.state.samlAttrMapFirstName}
                      onChange={e => adminSamlSecurityContainer.changeSamlAttrMapFirstName(e.target.value)}
                    />
                    <p className="form-text text-muted">
                      {/* eslint-disable-next-line max-len */}
                      <small dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.mapping_detail', { target: t('security_settings.form_item_name.attrMapFirstName') }) }} />
                    </p>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={adminSamlSecurityContainer.state.envAttrMapFirstName || ''}
                      readOnly
                    />
                    <p className="form-text text-muted">
                      <small>
                        <span dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.Use env var if empty', { env: 'SAML_ATTR_MAPPING_FIRST_NAME' }) }} />
                        <br />
                        <span dangerouslySetInnerHTML={{ __html: t('security_settings.Use default if both are empty', { target: 'firstName' }) }} />
                      </small>
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>{t('security_settings.form_item_name.attrMapLastName')}</th>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      defaultValue={adminSamlSecurityContainer.state.samlAttrMapLastName}
                      onChange={e => adminSamlSecurityContainer.changeSamlAttrMapLastName(e.target.value)}
                    />
                    <p className="form-text text-muted">
                      {/* eslint-disable-next-line max-len */}
                      <small dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.mapping_detail', { target: t('security_settings.form_item_name.attrMapLastName') }) }} />
                    </p>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      value={adminSamlSecurityContainer.state.envAttrMapLastName || ''}
                      readOnly
                    />
                    <p className="form-text text-muted">
                      <small>
                        <span dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.Use env var if empty', { env: 'SAML_ATTR_MAPPING_LAST_NAME' }) }} />
                        <br />
                        <span dangerouslySetInnerHTML={{ __html: t('security_settings.Use default if both are empty', { target: 'lastName' }) }} />
                      </small>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            <h3 className="alert-anchor border-bottom">
              Attribute Mapping Options
            </h3>

            <div className="row form-group mb-5">
              <div className="offset-md-3 col-md-6 text-left">
                <div className="custom-control custom-checkbox custom-checkbox-success">
                  <input
                    id="bindByUserName-SAML"
                    className="custom-control-input"
                    type="checkbox"
                    checked={adminSamlSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser || false}
                    onChange={() => { adminSamlSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="bindByUserName-SAML"
                    dangerouslySetInnerHTML={{ __html: t('security_settings.Treat username matching as identical') }}
                  />
                </div>
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_settings.Treat username matching as identical_warn') }} />
                </p>
              </div>
            </div>

            <div className="row form-group mb-5">
              <div className="offset-md-3 col-md-6 text-left">
                <div className="custom-control custom-checkbox custom-checkbox-success">
                  <input
                    id="bindByEmail-SAML"
                    className="custom-control-input"
                    type="checkbox"
                    checked={adminSamlSecurityContainer.state.isSameEmailTreatedAsIdenticalUser || false}
                    onChange={() => { adminSamlSecurityContainer.switchIsSameEmailTreatedAsIdenticalUser() }}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="bindByEmail-SAML"
                    dangerouslySetInnerHTML={{ __html: t('security_settings.Treat email matching as identical') }}
                  />
                </div>
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_settings.Treat email matching as identical_warn') }} />
                </p>
              </div>
            </div>

            <h3 className="alert-anchor border-bottom">
              Attribute-based Login Control
            </h3>

            <p className="form-text text-muted">
              <small dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.attr_based_login_control_detail') }} />
            </p>

            <table className="table settings-table">
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
                    { t('security_settings.form_item_name.ABLCRule') }
                  </th>
                  <td>
                    <textarea
                      className="form-control"
                      type="text"
                      defaultValue={adminSamlSecurityContainer.state.samlABLCRule || ''}
                      onChange={(e) => { adminSamlSecurityContainer.changeSamlABLCRule(e.target.value) }}
                    />
                    <div className="mt-2">
                      <p>
                        See&nbsp;
                        <a
                          href="https://lucene.apache.org/core/2_9_4/queryparsersyntax.html"
                          target="_blank"
                          rel="noreferer noreferrer"
                        >
                          Apache Lucene - Query Parser Syntax <i className="icon-share-alt"></i>
                        </a>.
                      </p>
                      <div className="accordion" id="accordionExample">
                        <div className="card">
                          <div className="card-header p-1">
                            <h2 className="mb-0">
                              <button
                                className="btn btn-link btn-block text-left"
                                type="button"
                                onClick={() => this.setState({ isHelpOpened: !this.state.isHelpOpened })}
                                aria-expanded="true"
                                aria-controls="ablchelp"
                              >
                                <i className={`icon-fw ${this.state.isHelpOpened ? 'icon-arrow-down' : 'icon-arrow-right'} small`}></i> Show more...
                              </button>
                            </h2>
                          </div>
                          <Collapse isOpen={this.state.isHelpOpened}>
                            <div className="card-body">
                              <p dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.attr_based_login_control_rule_help') }} />
                              <p dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.attr_based_login_control_rule_example1') }} />
                              <p dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.attr_based_login_control_rule_example2') }} />
                            </div>
                          </Collapse>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <textarea
                      className="form-control"
                      type="text"
                      value={adminSamlSecurityContainer.state.envABLCRule || ''}
                      readOnly
                    />
                    <p className="form-text text-muted">
                      <small dangerouslySetInnerHTML={{ __html: t('security_settings.SAML.Use env var if empty', { env: 'SAML_ABLC_RULE' }) }} />
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="row my-3">
              <div className="offset-3 col-5">
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

SamlSecurityManagementContents.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminSamlSecurityContainer: PropTypes.instanceOf(AdminSamlSecurityContainer).isRequired,
  siteUrl: PropTypes.string,
};

const SamlSecurityManagementContentsWrapperFC = (props) => {
  const { t } = useTranslation('admin');
  const { data: siteUrl } = useSiteUrl();
  return <SamlSecurityManagementContents t={t} siteUrl={siteUrl} {...props} />;
};

const SamlSecurityManagementContentsWrapper = withUnstatedContainers(SamlSecurityManagementContentsWrapperFC, [
  AdminGeneralSecurityContainer,
  AdminSamlSecurityContainer,
]);

export default SamlSecurityManagementContentsWrapper;
