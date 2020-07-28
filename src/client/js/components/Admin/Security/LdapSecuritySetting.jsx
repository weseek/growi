import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminLdapSecurityContainer from '../../../services/AdminLdapSecurityContainer';
import LdapAuthTestModal from './LdapAuthTestModal';


class LdapSecuritySetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isRetrieving: true,
      isLdapAuthTestModalShown: false,
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
    this.openLdapAuthTestModal = this.openLdapAuthTestModal.bind(this);
    this.closeLdapAuthTestModal = this.closeLdapAuthTestModal.bind(this);
  }

  async componentDidMount() {
    const { adminLdapSecurityContainer } = this.props;

    try {
      await adminLdapSecurityContainer.retrieveSecurityData();
    }
    catch (err) {
      toastError(err);
    }
    this.setState({ isRetrieving: false });
  }

  async onClickSubmit() {
    const { t, adminLdapSecurityContainer, adminGeneralSecurityContainer } = this.props;

    try {
      await adminLdapSecurityContainer.updateLdapSetting();
      await adminGeneralSecurityContainer.retrieveSetupStratedies();
      toastSuccess(t('security_setting.ldap.updated_ldap'));
    }
    catch (err) {
      toastError(err);
    }
  }

  openLdapAuthTestModal() {
    this.setState({ isLdapAuthTestModalShown: true });
  }

  closeLdapAuthTestModal() {
    this.setState({ isLdapAuthTestModalShown: false });
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminLdapSecurityContainer } = this.props;
    const { isLdapEnabled } = adminGeneralSecurityContainer.state;

    if (this.state.isRetrieving) {
      return null;
    }
    return (
      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          LDAP
        </h2>

        <div className="form-group row">
          <div className="col-6 offset-3">
            <div className="custom-control custom-switch custom-checkbox-success">
              <input
                id="isLdapEnabled"
                className="custom-control-input"
                type="checkbox"
                checked={isLdapEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsLdapEnabled() }}
              />
              <label className="custom-control-label" htmlFor="isLdapEnabled">
                {t('security_setting.ldap.enable_ldap')}
              </label>
            </div>
            {(!adminGeneralSecurityContainer.state.setupStrategies.includes('ldap') && isLdapEnabled)
              && <div className="badge badge-warning">{t('security_setting.setup_is_not_yet_complete')}</div>}
          </div>
        </div>


        {isLdapEnabled && (
          <React.Fragment>

            <h3 className="border-bottom">{t('security_setting.configuration')}</h3>

            <div className="form-group row">
              <label htmlFor="serverUrl" className="text-left text-md-right col-md-3 col-form-label">
                Server URL
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="serverUrl"
                  defaultValue={adminLdapSecurityContainer.state.serverUrl || ''}
                  onChange={e => adminLdapSecurityContainer.changeServerUrl(e.target.value)}
                />
                <small>
                  <p
                    className="form-text text-muted"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.server_url_detail') }}
                  />
                  {t('security_setting.example')}: <code>ldaps://ldap.company.com/ou=people,dc=company,dc=com</code>
                </small>
              </div>
            </div>

            <div className="form-group row">
              <label className="text-left text-md-right col-md-3 col-form-label">
                <strong>{t('security_setting.ldap.bind_mode')}</strong>
              </label>
              <div className="col-md-6">
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="true"
                  >
                    {adminLdapSecurityContainer.state.isUserBind
                        ? <span className="pull-left">{t('security_setting.ldap.bind_user')}</span>
                        : <span className="pull-left">{t('security_setting.ldap.bind_manager')}</span>}
                  </button>
                  <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <button className="dropdown-item" type="button" onClick={() => { adminLdapSecurityContainer.changeLdapBindMode(true) }}>
                      {t('security_setting.ldap.bind_user')}
                    </button>
                    <button className="dropdown-item" type="button" onClick={() => { adminLdapSecurityContainer.changeLdapBindMode(false) }}>
                      {t('security_setting.ldap.bind_manager')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group row">
              <label className="text-left text-md-right col-md-3 col-form-label">
                <strong>Bind DN</strong>
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="bindDN"
                  defaultValue={adminLdapSecurityContainer.state.ldapBindDN || ''}
                  onChange={e => adminLdapSecurityContainer.changeBindDN(e.target.value)}
                />
                {(adminLdapSecurityContainer.state.isUserBind === true) ? (
                  <p className="form-text text-muted passport-ldap-userbind">
                    <small>
                      {t('security_setting.ldap.bind_DN_user_detail1')}<br />
                      {/* eslint-disable-next-line react/no-danger */}
                      <span dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.bind_DN_user_detail2') }} /><br />
                      {t('security_setting.example')}1: <code>uid={'{{ username }}'},dc=domain,dc=com</code><br />
                      {t('security_setting.example')}2: <code>{'{{ username }}'}@domain.com</code>
                    </small>
                  </p>
                )
                  : (
                    <p className="form-text text-muted passport-ldap-managerbind">
                      <small>
                        {t('security_setting.ldap.bind_DN_manager_detail')}<br />
                        {t('security_setting.example')}1: <code>uid=admin,dc=domain,dc=com</code><br />
                        {t('security_setting.example')}2: <code>admin@domain.com</code>
                      </small>
                    </p>
                  )}
              </div>
            </div>

            <div className="form-group row">
              <div htmlFor="bindDNPassword" className="text-left text-md-right col-md-3 col-form-label">
                <strong>{t('security_setting.ldap.bind_DN_password')}</strong>
              </div>
              <div className="col-md-6">
                {(adminLdapSecurityContainer.state.isUserBind) ? (
                  <p className="well card passport-ldap-userbind">
                    <small>
                      {t('security_setting.ldap.bind_DN_password_user_detail')}
                    </small>
                  </p>
                )
                  : (
                    <>
                      <p className="well card passport-ldap-managerbind">
                        <small>
                          {t('security_setting.ldap.bind_DN_password_manager_detail')}
                        </small>
                      </p>
                      <input
                        className="form-control passport-ldap-managerbind"
                        type="password"
                        name="bindDNPassword"
                        defaultValue={adminLdapSecurityContainer.state.ldapBindDNPassword || ''}
                        onChange={e => adminLdapSecurityContainer.changeBindDNPassword(e.target.value)}
                      />
                    </>
                  )}
              </div>
            </div>

            <div className="form-group row">
              <label className="text-left text-md-right col-md-3 col-form-label">
                <strong>{t('security_setting.ldap.search_filter')}</strong>
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="searchFilter"
                  defaultValue={adminLdapSecurityContainer.state.ldapSearchFilter || ''}
                  onChange={e => adminLdapSecurityContainer.changeSearchFilter(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small>
                    {t('security_setting.ldap.search_filter_detail1')}<br />
                    {/* eslint-disable-next-line react/no-danger */}
                    <span dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.search_filter_detail2') }} /><br />
                    {/* eslint-disable-next-line react/no-danger */}
                    <span dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.search_filter_detail3') }} />
                  </small>
                </p>
                <p className="form-text text-muted">
                  <small>
                    {t('security_setting.example')}1 - {t('security_setting.ldap.search_filter_example1')}:
                    <code>(|(uid={'{{ username }}'})(mail={'{{ username }}'}))</code><br />
                    {t('security_setting.example')}2 - {t('security_setting.ldap.search_filter_example2')}:
                    <code>(sAMAccountName={'{{ username }}'})</code>
                  </small>
                </p>
              </div>
            </div>

            <h3 className="alert-anchor border-bottom">
              Attribute Mapping ({t('security_setting.optional')})
            </h3>

            <div className="form-group row">
              <label className="text-left text-md-right col-md-3 col-form-label">
                <strong htmlFor="attrMapUsername">{t('username')}</strong>
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Default: uid"
                  name="attrMapUsername"
                  defaultValue={adminLdapSecurityContainer.state.ldapAttrMapUsername || ''}
                  onChange={e => adminLdapSecurityContainer.changeAttrMapUsername(e.target.value)}
                />
                <p className="form-text text-muted">
                  {/* eslint-disable-next-line react/no-danger */}
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.username_detail') }} />
                </p>
              </div>
            </div>

            <div className="form-group row">
              <div className="offset-md-3 col-md-6">
                <div className="custom-control custom-checkbox custom-checkbox-success">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="isSameUsernameTreatedAsIdenticalUser"
                    checked={adminLdapSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser}
                    onChange={() => { adminLdapSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="isSameUsernameTreatedAsIdenticalUser"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: t('security_setting.Treat username matching as identical') }}
                  />
                </div>
                <p className="form-text text-muted">
                  {/* eslint-disable-next-line react/no-danger */}
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Treat username matching as identical_warn') }} />
                </p>
              </div>
            </div>

            <div className="form-group row">
              <label className="text-left text-md-right col-md-3 col-form-label">
                <strong htmlFor="attrMapMail">{t('Email')}</strong>
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Default: mail"
                  name="attrMapMail"
                  defaultValue={adminLdapSecurityContainer.state.ldapAttrMapMail || ''}
                  onChange={e => adminLdapSecurityContainer.changeAttrMapMail(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small>
                    {t('security_setting.ldap.mail_detail')}
                  </small>
                </p>
              </div>
            </div>

            <div className="form-group row">
              <label className="text-left text-md-right col-md-3 col-form-label">
                <strong htmlFor="attrMapName">{t('Name')}</strong>
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="attrMapName"
                  defaultValue={adminLdapSecurityContainer.state.ldapAttrMapName || ''}
                  onChange={e => adminLdapSecurityContainer.changeAttrMapName(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small>
                    {t('security_setting.ldap.name_detail')}
                  </small>
                </p>
              </div>
            </div>


            <h3 className="alert-anchor border-bottom">
              {t('security_setting.ldap.group_search_filter')} ({t('security_setting.optional')})
            </h3>

            <div className="form-group row">
              <label className="text-left text-md-right col-md-3 col-form-label">
                <strong htmlFor="groupSearchBase">{t('security_setting.ldap.group_search_base_DN')}</strong>
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="groupSearchBase"
                  defaultValue={adminLdapSecurityContainer.state.ldapGroupSearchBase || ''}
                  onChange={e => adminLdapSecurityContainer.changeGroupSearchBase(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small>
                    {/* eslint-disable-next-line react/no-danger */}
                    <span dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.group_search_base_DN_detail') }} /><br />
                    {t('security_setting.example')}: <code>ou=groups,dc=domain,dc=com</code>
                  </small>
                </p>
              </div>
            </div>

            <div className="form-group row">
              <label className="text-left text-md-right col-md-3 col-form-label">
                <strong htmlFor="groupSearchFilter">{t('security_setting.ldap.group_search_filter')}</strong>
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="groupSearchFilter"
                  defaultValue={adminLdapSecurityContainer.state.ldapGroupSearchFilter || ''}
                  onChange={e => adminLdapSecurityContainer.changeGroupSearchFilter(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small>
                    {/* eslint-disable react/no-danger */}
                    <span dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.group_search_filter_detail1') }} /><br />
                    <span dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.group_search_filter_detail2') }} /><br />
                    <span dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.group_search_filter_detail3') }} />
                    {/* eslint-enable react/no-danger */}
                  </small>
                </p>
                <p className="form-text text-muted">
                  <small>
                    {t('security_setting.example')}:
                    {/* eslint-disable-next-line react/no-danger */}
                    <span dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.group_search_filter_detail4') }} />
                  </small>
                </p>
              </div>
            </div>

            <div className="form-group row">
              <label className="text-left text-md-right col-md-3 col-form-label">
                <strong htmlFor="groupDnProperty">{t('security_setting.ldap.group_search_user_DN_property')}</strong>
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Default: uid"
                  name="groupDnProperty"
                  defaultValue={adminLdapSecurityContainer.state.ldapGroupDnProperty || ''}
                  onChange={e => adminLdapSecurityContainer.changeGroupDnProperty(e.target.value)}
                />
                <p className="form-text text-muted">
                  {/* eslint-disable-next-line react/no-danger */}
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.group_search_user_DN_property_detail') }} />
                </p>
              </div>
            </div>
            <div className="row my-3">
              <div className="offset-3 col-5">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={adminLdapSecurityContainer.state.retrieveError != null}
                  onClick={this.onClickSubmit}
                >
                  {t('Update')}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary ml-2"
                  onClick={this.openLdapAuthTestModal}
                >{t('security_setting.ldap.test_config')}
                </button>
              </div>
            </div>

          </React.Fragment>
        )}


        <LdapAuthTestModal isOpen={this.state.isLdapAuthTestModalShown} onClose={this.closeLdapAuthTestModal} />

      </React.Fragment>
    );
  }

}

LdapSecuritySetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminLdapSecurityContainer: PropTypes.instanceOf(AdminLdapSecurityContainer).isRequired,
};

const LdapSecuritySettingWrapper = withUnstatedContainers(LdapSecuritySetting, [AppContainer, AdminGeneralSecurityContainer, AdminLdapSecurityContainer]);

export default withTranslation()(LdapSecuritySettingWrapper);
