import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import LdapSecuritySetting from './LdapSecuritySetting';
import LocalSecuritySetting from './LocalSecuritySetting';
import SamlSecuritySetting from './SamlSecuritySetting';
import OidcSecuritySetting from './OidcSecuritySetting';
import BasicSecuritySetting from './BasicSecuritySetting';

class SecurityManagement extends React.Component {

  constructor(props) {
    super();

  }

  render() {
    const { t } = this.props;
    return (
      <Fragment>
        {/* TODO GW-582 reactify-admin */}
        <fieldset>
          <legend className="alert-anchor">{ t('security_settings') }</legend>
          <div className="form-group">
            <label htmlFor="settingForm[security:restrictGuestMode]" className="col-xs-3 control-label">{ t('security_setting.Guest Users Access') }</label>
            <div className="col-xs-6">
              <select
                className="form-control selectpicker"
                name="settingForm[security:restrictGuestMode]"
                value="{ getConfig('crowi', 'security:restrictGuestMode') }"
              >
                <option value="{ t(modeValue) }">{ t('modeLabel') }</option>
              </select>
              <p className="alert alert-warning mt-2">
                <i className="icon-exclamation icon-fw">
                </i><b>FIXED</b>
                { t('security_setting.Fixed by env var', 'FORCE_WIKI_MODE') }<br></br>
              </p>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="{{configName}}" className="col-xs-3 control-label">{ t('security_setting.page_listing_1') }</label>
            <div className="col-xs-9">
              <div className="btn-group btn-toggle" data-toggle="buttons">
                <label className="btn btn-default btn-rounded btn-outline {% if isEnabled %}active{% endif %}" data-active-class="primary">
                  <input name="{{configName}}" value="false" type="radio"></input>
                </label>
                <label className="btn btn-default btn-rounded btn-outline {% if !isEnabled %}active{% endif %}" data-active-class="default">
                  <input name="{{configName}}" value="true" type="radio"></input>
                </label>
              </div>
              <p className="help-block small">
                { t('security_setting.page_listing_1_desc') }
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="{{configName}}" className="col-xs-3 control-label">{ t('security_setting.page_listing_2') }</label>
            <div className="col-xs-9">
              <div className="btn-group btn-toggle" data-toggle="buttons">
                <label className="btn btn-default btn-rounded btn-outline {% if isEnabled %}active{% endif %}" data-active-class="primary">
                  <input name="{{configName}}" value="false" type="radio" />
                </label>
                <label className="btn btn-default btn-rounded btn-outline {% if !isEnabled %}active{% endif %}" data-active-class="default">
                  <input name="{{configName}}" value="true" type="radio" />
                </label>
              </div>

              <p className="help-block small">
                { t('security_setting.page_listing_2_desc') }
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="{{configName}}" className="col-xs-3 control-label">{ t('security_setting.complete_deletion') }</label>
            <div className="col-xs-6">
              <select className="form-control selectpicker" name="settingForm[security:pageCompleteDeletionAuthority]" value="{{ configValue }}">
                <option value="anyOne">{ t('security_setting.anyone') }</option>
                <option value="adminOnly">{ t('security_setting.admin_only') }</option>
                <option value="adminAndAuthor">{ t('security_setting.admin_and_author') }</option>
              </select>

              <p className="help-block small">
                { t('security_setting.complete_deletion_explain') }
              </p>
            </div>
          </div>
          {/* TODO GW-540 */}
          <div className="form-group">
            <div className="col-xs-offset-3 col-xs-6">
              <input type="hidden" name="_csrf" value={this.props.csrf} />
            </div>
          </div>
        </fieldset>

        {/* XSS configuration link */}
        <div className="mb-5">
          <h2 className="border-bottom">{ t('security_setting.xss_prevent_setting') }</h2>
          <div className="text-center">
            <a style={{ fontSize: 'large' }} href="/admin/markdown/#preventXSS">
              <i className="fa-fw icon-login"></i> { t('security_setting.xss_prevent_setting_link') }
            </a>
          </div>
        </div>

        {/* TODO 542~550 reactify-admin */}
        <div className="auth-mechanism-configurations m-t-10">
          <h2 className="border-bottom">{ t('security_setting.Authentication mechanism settings') }</h2>
          <div className="passport-settings">
            <ul className="nav nav-tabs" role="tablist">
              <li className="active">
                <a href="#passport-local" data-toggle="tab" role="tab"><i className="fa fa-users"></i> ID/Pass</a>
              </li>
              <li>
                <a href="#passport-ldap" data-toggle="tab" role="tab"><i className="fa fa-sitemap"></i> LDAP</a>
              </li>
              <li>
                <a href="#passport-saml" data-toggle="tab" role="tab"><i className="fa fa-key"></i> SAML</a>
              </li>
              <li>
                <a href="#passport-oidc" data-toggle="tab" role="tab"><i className="fa fa-openid"></i> OIDC</a>
              </li>
              <li>
                <a href="#passport-basic" data-toggle="tab" role="tab"><i className="fa fa-lock"></i> Basic</a>
              </li>
              <li>
                <a href="#passport-google-oauth" data-toggle="tab" role="tab"><i className="fa fa-google"></i> Google</a>
              </li>
              <li>
                <a href="#passport-github" data-toggle="tab" role="tab"><i className="fa fa-github"></i> GitHub</a>
              </li>
              <li>
                <a href="#passport-twitter" data-toggle="tab" role="tab"><i className="fa fa-twitter"></i> Twitter</a>
              </li>
              <li className="tbd">
                <a href="#passport-facebook" data-toggle="tab" role="tab"><i className="fa fa-facebook"></i> (TBD) Facebook</a>
              </li>
            </ul>
            <div className="tab-content p-t-10">
              <div id="passport-local" className="tab-pane active" role="tabpanel">
                <LocalSecuritySetting />
              </div>
              <div id="passport-ldap" className="tab-pane" role="tabpanel">
                <LdapSecuritySetting />
              </div>
              <div id="passport-saml" className="tab-pane" role="tabpanel">
                <SamlSecuritySetting />
              </div>
              <div id="passport-oidc" className="tab-pane" role="tabpanel">
                <OidcSecuritySetting />
              </div>
              <div id="passport-basic" className="tab-pane" role="tabpanel">
                <BasicSecuritySetting />
              </div>
              <div id="passport-google-oauth" className="tab-pane" role="tabpanel">
                {/* TODO GW-547 reactify google-oauth.html */}
              </div>
              <div id="passport-github" className="tab-pane" role="tabpanel">
                {/* TODO GW-548 reactify github.html */}
              </div>
              <div id="passport-twitter" className="tab-pane" role="tabpanel">
                {/* TODO GW-549 reactify twitter.html */}
              </div>
              <div id="passport-facebook" className="tab-pane" role="tabpanel">
                {/* TODO GW-550 reactify facebook.html */}
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

}

SecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  csrf: PropTypes.string,
};

const SecurityManagementWrapper = (props) => {
  return createSubscribedElement(SecurityManagement, props, [AppContainer]);
};

export default withTranslation()(SecurityManagementWrapper);
