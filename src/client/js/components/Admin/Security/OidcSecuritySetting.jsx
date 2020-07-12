/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminOidcSecurityContainer from '../../../services/AdminOidcSecurityContainer';

class OidcSecurityManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isRetrieving: true,
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async componentDidMount() {
    const { adminOidcSecurityContainer } = this.props;

    try {
      await adminOidcSecurityContainer.retrieveSecurityData();
    }
    catch (err) {
      toastError(err);
    }
    this.setState({ isRetrieving: false });
  }

  async onClickSubmit() {
    const { t, adminOidcSecurityContainer, adminGeneralSecurityContainer } = this.props;

    try {
      await adminOidcSecurityContainer.updateOidcSetting();
      await adminGeneralSecurityContainer.retrieveSetupStratedies();
      toastSuccess(t('security_setting.OAuth.OIDC.updated_oidc'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminOidcSecurityContainer } = this.props;
    const { isOidcEnabled } = adminGeneralSecurityContainer.state;

    if (this.state.isRetrieving) {
      return null;
    }

    return (

      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          {t('security_setting.OAuth.OIDC.name')}
        </h2>

        <div className="row mb-5 form-group">
          <div className="offset-3 col-6">
            <div className="custom-control custom-switch custom-checkbox-success">
              <input
                id="isOidcEnabled"
                className="custom-control-input"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isOidcEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsOidcEnabled() }}
              />
              <label className="custom-control-label" htmlFor="isOidcEnabled">
                {t('security_setting.OAuth.enable_oidc')}
              </label>
            </div>
            {(!adminGeneralSecurityContainer.state.setupStrategies.includes('oidc') && isOidcEnabled)
              && <div className="badge badge-warning">{t('security_setting.setup_is_not_yet_complete')}</div>}
          </div>
        </div>

        <div className="row mb-5 form-group">
          <label className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.callback_URL')}</label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              value={adminOidcSecurityContainer.state.callbackUrl}
              readOnly
            />
            <p className="form-text text-muted small">{t('security_setting.desc_of_callback_URL', { AuthName: 'OAuth' })}</p>
            {!adminGeneralSecurityContainer.state.appSiteUrl && (
              <div className="alert alert-danger">
                <i
                  className="icon-exclamation"
                  // eslint-disable-next-line max-len
                  dangerouslySetInnerHTML={{ __html: t('security_setting.alert_siteUrl_is_not_set', { link: `<a href="/admin/app">${t('App Settings')}<i class="icon-login"></i></a>` }) }}
                />
              </div>
            )}
          </div>
        </div>

        {isOidcEnabled && (
          <React.Fragment>

            <h3 className="border-bottom">{t('security_setting.configuration')}</h3>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcProviderName" className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.providerName')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcProviderName"
                  defaultValue={adminOidcSecurityContainer.state.oidcProviderName || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcProviderName(e.target.value)}
                />
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcIssuerHost" className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.issuerHost')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcIssuerHost"
                  defaultValue={adminOidcSecurityContainer.state.oidcIssuerHost || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcIssuerHost(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_OIDC_ISSUER_HOST' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcClientId" className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.clientID')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcClientId"
                  defaultValue={adminOidcSecurityContainer.state.oidcClientId || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcClientId(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_OIDC_CLIENT_ID' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcClientSecret" className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.client_secret')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcClientSecret"
                  defaultValue={adminOidcSecurityContainer.state.oidcClientSecret || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcClientSecret(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_OIDC_CLIENT_SECRET' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcAuthorizationEndpoint" className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.authorization_endpoint')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcAuthorizationEndpoint"
                  defaultValue={adminOidcSecurityContainer.state.oidcAuthorizationEndpoint || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcAuthorizationEndpoint(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.Use discovered URL if empty') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcTokenEndpoint" className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.token_endpoint')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcTokenEndpoint"
                  defaultValue={adminOidcSecurityContainer.state.oidcTokenEndpoint || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcTokenEndpoint(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.Use discovered URL if empty') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcRevocationEndpoint" className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.revocation_endpoint')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcRevocationEndpoint"
                  defaultValue={adminOidcSecurityContainer.state.oidcRevocationEndpoint || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcRevocationEndpoint(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.Use discovered URL if empty') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcIntrospectionEndpoint" className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.introspection_endpoint')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcIntrospectionEndpoint"
                  defaultValue={adminOidcSecurityContainer.state.oidcIntrospectionEndpoint || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcIntrospectionEndpoint(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.Use discovered URL if empty') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcUserInfoEndpoint" className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.userinfo_endpoint')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcUserInfoEndpoint"
                  defaultValue={adminOidcSecurityContainer.state.oidcUserInfoEndpoint || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcUserInfoEndpoint(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.Use discovered URL if empty') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcEndSessionEndpoint" className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.end_session_endpoint')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcEndSessionEndpoint"
                  defaultValue={adminOidcSecurityContainer.state.oidcEndSessionEndpoint || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcEndSessionEndpoint(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.Use discovered URL if empty') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcRegistrationEndpoint" className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.registration_endpoint')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcRegistrationEndpoint"
                  defaultValue={adminOidcSecurityContainer.state.oidcRegistrationEndpoint || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcRegistrationEndpoint(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.Use discovered URL if empty') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcJWKSUri" className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.jwks_uri')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcJWKSUri"
                  defaultValue={adminOidcSecurityContainer.state.oidcJWKSUri || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcJWKSUri(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.Use discovered URL if empty') }} />
                </p>
              </div>
            </div>

            <h3 className="alert-anchor border-bottom">
              Attribute Mapping ({t('security_setting.optional')})
            </h3>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcAttrMapId" className="text-left text-md-right col-md-3 col-form-label">Identifier</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcAttrMapId"
                  defaultValue={adminOidcSecurityContainer.state.oidcAttrMapId || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcAttrMapId(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.id_detail') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcAttrMapUserName" className="text-left text-md-right col-md-3 col-form-label">{t('username')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcAttrMapUserName"
                  defaultValue={adminOidcSecurityContainer.state.oidcAttrMapUserName || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcAttrMapUserName(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.username_detail') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcAttrMapName" className="text-left text-md-right col-md-3 col-form-label">{t('Name')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcAttrMapName"
                  defaultValue={adminOidcSecurityContainer.state.oidcAttrMapName || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcAttrMapName(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.name_detail') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label htmlFor="oidcAttrMapEmail" className="text-left text-md-right col-md-3 col-form-label">{t('Email')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcAttrMapEmail"
                  defaultValue={adminOidcSecurityContainer.state.oidcAttrMapEmail || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcAttrMapEmail(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.mapping_detail', { target: t('Email') }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <label className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.callback_URL')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  defaultValue={adminOidcSecurityContainer.state.callbackUrl || ''}
                  readOnly
                />
                <p className="form-text text-muted small">{t('security_setting.desc_of_callback_URL', { AuthName: 'OAuth' })}</p>
                {!adminGeneralSecurityContainer.state.appSiteUrl && (
                  <div className="alert alert-danger">
                    <i
                      className="icon-exclamation"
                      // eslint-disable-next-line max-len
                      dangerouslySetInnerHTML={{ __html: t('security_setting.alert_siteUrl_is_not_set', { link: `<a href="/admin/app">${t('App Settings')}<i class="icon-login"></i></a>` }) }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="row mb-5 form-group">
              <div className="offset-md-3 col-md-6">
                <div className="custom-control custom-checkbox custom-checkbox-success">
                  <input
                    id="bindByUserName-oidc"
                    className="custom-control-input"
                    type="checkbox"
                    checked={adminOidcSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser}
                    onChange={() => { adminOidcSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="bindByUserName-oidc"
                    dangerouslySetInnerHTML={{ __html: t('security_setting.Treat username matching as identical') }}
                  />
                </div>
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Treat username matching as identical_warn') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5 form-group">
              <div className="offset-md-3 col-md-6">
                <div className="custom-control custom-checkbox custom-checkbox-success">
                  <input
                    id="bindByEmail-oidc"
                    className="custom-control-input"
                    type="checkbox"
                    checked={adminOidcSecurityContainer.state.isSameEmailTreatedAsIdenticalUser || false}
                    onChange={() => { adminOidcSecurityContainer.switchIsSameEmailTreatedAsIdenticalUser() }}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="bindByEmail-oidc"
                    dangerouslySetInnerHTML={{ __html: t('security_setting.Treat email matching as identical') }}
                  />
                </div>
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Treat email matching as identical_warn') }} />
                </p>
              </div>
            </div>

            <div className="row my-3">
              <div className="offset-3 col-5">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={adminOidcSecurityContainer.state.retrieveError != null}
                  onClick={this.onClickSubmit}
                >
                  {t('Update')}
                </button>
              </div>
            </div>
          </React.Fragment>
        )}


        <hr />

        <div style={{ minHeight: '300px' }}>
          <h4>
            <i className="icon-question" aria-hidden="true" />
            <a href="#collapseHelpForOidcOauth" data-toggle="collapse"> {t('security_setting.OAuth.how_to.oidc')}</a>
          </h4>
          <ol id="collapseHelpForOidcOauth" className="collapse">
            <li>{t('security_setting.OAuth.OIDC.register_1')}</li>
            <li>{t('security_setting.OAuth.OIDC.register_2')}</li>
            <li>{t('security_setting.OAuth.OIDC.register_3')}</li>
          </ol>
        </div>

      </React.Fragment>
    );
  }

}

OidcSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminOidcSecurityContainer: PropTypes.instanceOf(AdminOidcSecurityContainer).isRequired,
};

const OidcSecurityManagementWrapper = withUnstatedContainers(OidcSecurityManagement, [AppContainer, AdminGeneralSecurityContainer, AdminOidcSecurityContainer]);

export default withTranslation()(OidcSecurityManagementWrapper);
