import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';

class MailSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }


  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <p className="well">{t('app_setting.SMTP_used')} {t('app_setting.SMTP_but_AWS')}<br />{t('app_setting.neihter_of')}</p>
        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="settingForm[mail.from]" className="col-xs-3 control-label">{t('app_setting.From e-mail address')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[mail.from]"
                  type="text"
                  name="settingForm[mail:from]"
                  placeholder="{{ t('eg') }} mail@growi.org"
                  value="{{ getConfig('crowi', 'mail:from') | default('') }}"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label className="col-xs-3 control-label">{ t('app_setting.SMTP settings') }</label>
              <div className="col-xs-4">
                <label>{ t('app_setting.Host') }</label>
                <input
                  className="form-control"
                  type="text"
                  name="settingForm[mail:smtpHost]"
                  value="{{ getConfig('crowi', 'mail:smtpHost') | default('') }}"
                />
              </div>
              <div className="col-xs-2">
                <label>{ t('app_setting.Port') }</label>
                <input
                  className="form-control"
                  type="text"
                  name="settingForm[mail:smtpPort]"
                  value="{{ getConfig('crowi', 'mail:smtpPort') | default('') }}"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <div className="col-xs-3 col-xs-offset-3">
                <label>{ t('app_setting.User') }</label>
                <input
                  className="form-control"
                  type="text"
                  name="settingForm[mail:smtpUser]"
                  value="{{ getConfig('crowi', 'mail:smtpUser') | default('') }}"
                />
              </div>
              <div className="col-xs-3">
                <label>{ t('Password') }</label>
                <input
                  className="form-control"
                  type="password"
                  name="settingForm[mail:smtpPassword]"
                  value="{{ getConfig('crowi', 'mail:smtpPassword') | default('') }}"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <div className="col-xs-offset-3 col-xs-6">
                <input type="hidden" name="_csrf" value="{{ csrf() }}" />
                <button type="submit" className="btn btn-primary">
                  {t('app_setting.Update')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const MailSettingWrapper = (props) => {
  return createSubscribedElement(MailSetting, props, [AppContainer]);
};

MailSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(MailSettingWrapper);
