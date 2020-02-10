/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminOidcSecurityContainer from '../../../services/AdminOidcSecurityContainer';

const logger = loggerFactory('growi:security:AdminGoogleSecurityContainer');

class OidcSecurityManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      retrieveError: null,
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
      this.setState({ retrieveError: err.message });
      logger.error(err);
    }
  }

  async onClickSubmit() {
    const { t, adminOidcSecurityContainer } = this.props;

    try {
      await adminOidcSecurityContainer.updateOidcSetting();
      toastSuccess(t('security_setting.OAuth.OIDC.updated_oidc'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminOidcSecurityContainer } = this.props;

    return (

      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          {t('security_setting.OAuth.OIDC.name')} {t('security_setting.configuration')}
        </h2>

        {this.state.retrieveError != null && (
          <div className="alert alert-danger">
            <p>{t('Error occurred')} : {this.state.err}</p>
          </div>
        )}

        <div className="row mb-5">
          <strong className="col-xs-3 text-right">{t('security_setting.OAuth.OIDC.name')}</strong>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isOidcEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isOidcEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsOidcEnabled() }}
              />
              <label htmlFor="isOidcEnabled">
                {t('security_setting.OAuth.enable_oidc')}
              </label>
            </div>
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-xs-3 text-right">{t('security_setting.callback_URL')}</label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="text"
              value={adminOidcSecurityContainer.state.callbackUrl}
              readOnly
            />
            <p className="help-block small">{t('security_setting.desc_of_callback_URL', { AuthName: 'OAuth' })}</p>
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

        {adminGeneralSecurityContainer.state.isOidcEnabled && (
          <React.Fragment>

            <div className="row mb-5">
              <label htmlFor="oidcProviderName" className="col-xs-3 text-right">{t('security_setting.providerName')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcProviderName"
                  value={adminOidcSecurityContainer.state.oidcProviderName || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcProviderName(e.target.value)}
                />
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="oidcIssuerHost" className="col-xs-3 text-right">{t('security_setting.issuerHost')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcIssuerHost"
                  value={adminOidcSecurityContainer.state.oidcIssuerHost || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcIssuerHost(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_OIDC_ISSUER_HOST' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="oidcClientId" className="col-xs-3 text-right">{t('security_setting.clientID')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcClientId"
                  value={adminOidcSecurityContainer.state.oidcClientId || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcClientId(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_OIDC_CLIENT_ID' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="oidcClientSecret" className="col-xs-3 text-right">{t('security_setting.client_secret')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcClientSecret"
                  value={adminOidcSecurityContainer.state.oidcClientSecret || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcClientSecret(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_OIDC_CLIENT_SECRET' }) }} />
                </p>
              </div>
            </div>

            <h3 className="alert-anchor border-bottom">
              Attribute Mapping ({t('security_setting.optional')})
            </h3>

            <div className="row mb-5">
              <label htmlFor="oidcAttrMapId" className="col-xs-3 text-right">Identifier</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcAttrMapId"
                  value={adminOidcSecurityContainer.state.oidcAttrMapId || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcAttrMapId(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.id_detail') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="oidcAttrMapUserName" className="col-xs-3 text-right">{t('username')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcAttrMapUserName"
                  value={adminOidcSecurityContainer.state.oidcAttrMapUserName || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcAttrMapUserName(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.username_detail') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="oidcAttrMapName" className="col-xs-3 text-right">{t('Name')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcAttrMapName"
                  value={adminOidcSecurityContainer.state.oidcAttrMapName || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcAttrMapName(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.name_detail') }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="oidcAttrMapEmail" className="col-xs-3 text-right">{t('Email')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="oidcAttrMapEmail"
                  value={adminOidcSecurityContainer.state.oidcAttrMapEmail || ''}
                  onChange={e => adminOidcSecurityContainer.changeOidcAttrMapEmail(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.OIDC.mapping_detail', { target: t('Email') }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label className="col-xs-3 text-right">{t('security_setting.callback_URL')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  value={adminOidcSecurityContainer.state.callbackUrl || ''}
                  readOnly
                />
                <p className="help-block small">{t('security_setting.desc_of_callback_URL', { AuthName: 'OAuth' })}</p>
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

            <div className="row mb-3">
              <div className="col-xs-offset-3 col-xs-6 text-left">
                <div className="checkbox checkbox-success">
                  <input
                    id="bindByUserName-oidc"
                    type="checkbox"
                    checked={adminOidcSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser}
                    onChange={() => { adminOidcSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    htmlFor="bindByUserName-oidc"
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
                    id="bindByEmail-oidc"
                    type="checkbox"
                    checked={adminOidcSecurityContainer.state.isSameEmailTreatedAsIdenticalUser || false}
                    onChange={() => { adminOidcSecurityContainer.switchIsSameEmailTreatedAsIdenticalUser() }}
                  />
                  <label
                    htmlFor="bindByEmail-oidc"
                    dangerouslySetInnerHTML={{ __html: t('security_setting.Treat email matching as identical') }}
                  />
                </div>
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Treat email matching as identical_warn') }} />
                </p>
              </div>
            </div>

          </React.Fragment>
        )}

        <div className="row my-3">
          <div className="col-xs-offset-3 col-xs-5">
            <button type="button" className="btn btn-primary" disabled={this.state.retrieveError != null} onClick={this.onClickSubmit}>{t('Update')}</button>
          </div>
        </div>

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

const OidcSecurityManagementWrapper = (props) => {
  return createSubscribedElement(OidcSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminOidcSecurityContainer]);
};

export default withTranslation()(OidcSecurityManagementWrapper);
