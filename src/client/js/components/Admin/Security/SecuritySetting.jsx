import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminSecuritySettingContainer from '../../../services/AdminSecuritySettingContainer';

class SecuritySetting extends React.Component {

  render() {
    const { t, adminSecuritySettingContainer } = this.props;
    return (
      <Fragment>
        <fieldset>
          <legend className="alert-anchor">{ t('security_settings') }</legend>
          <div className="form-group">
            <label htmlFor="settingForm[security:restrictGuestMode]" className="col-xs-3 control-label">{ t('security_setting.Guest Users Access') }</label>
            <div className="col-xs-6">
              <input
                id="restrictGuestMode"
                type="checkbox"
                checked={adminSecuritySettingContainer.state.currentRestrictGuestMode}
                onChange={() => { adminSecuritySettingContainer.switchRestrictGuestMode() }}
              />
              <option value={adminSecuritySettingContainer.state.currentRestrictGuestMode}>{ t('modeLabel') }</option>
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
      </Fragment>
    );
  }

}

SecuritySetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  csrf: PropTypes.string,
  adminSecuritySettingContainer: PropTypes.instanceOf(AdminSecuritySettingContainer).isRequired,
};

const SecuritySettingWrapper = (props) => {
  return createSubscribedElement(SecuritySetting, props, [AppContainer]);
};

export default withTranslation()(SecuritySettingWrapper);
