import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';

const logger = loggerFactory('growi:appSettings');

class MailSetting extends React.Component {

  constructor(props) {
    super(props);

    this.submitHandler = this.submitHandler.bind(this);
  }

  async submitHandler() {
    const { t, adminAppContainer } = this.props;

    try {
      await adminAppContainer.updateMailSettingHandler();
      toastSuccess(t('app_setting.updated_app_setting'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminAppContainer } = this.props;

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
                  placeholder={`${t('eg')} mail@growi.org`}
                  defaultValue={adminAppContainer.state.fromAddress}
                  onChange={(e) => { adminAppContainer.changeFromAddress(e.target.value) }}
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
                  defaultValue={adminAppContainer.state.smtpHost}
                  onChange={(e) => { adminAppContainer.changeSmtpHost(e.target.value) }}
                />
              </div>
              <div className="col-xs-2">
                <label>{ t('app_setting.Port') }</label>
                <input
                  className="form-control"
                  type="text"
                  name="settingForm[mail:smtpPort]"
                  defaultValue={adminAppContainer.state.smtpPort}
                  onChange={(e) => { adminAppContainer.changeSmtpPort(e.target.value) }}
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
                  defaultValue={adminAppContainer.state.SmtpUser}
                  onChange={(e) => { adminAppContainer.changeSmtpUser(e.target.value) }}
                />
              </div>
              <div className="col-xs-3">
                <label>{ t('Password') }</label>
                <input
                  className="form-control"
                  type="password"
                  name="settingForm[mail:smtpPassword]"
                  defaultValue={adminAppContainer.state.smtpPassword}
                  onChange={(e) => { adminAppContainer.changeSmtpPassword(e.target.value) }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <div className="col-xs-offset-3 col-xs-6">
                <button type="submit" className="btn btn-primary" onClick={this.submitHandler}>
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
  return createSubscribedElement(MailSetting, props, [AppContainer, AdminAppContainer]);
};

MailSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(MailSettingWrapper);
