import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

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
      toastSuccess(t('toster.update_successed', { target: t('admin:app_setting.mail_settings') }));
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
        <p className="well">{t('admin:app_setting.smtp_used')} {t('admin:app_setting.smtp_but_aws')}<br />{t('admin:app_setting.neihter_of')}</p>
        <div className="row mb-5">
          <label className="col-xs-3 control-label">{t('admin:app_setting.from_e-mail_address')}</label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="text"
              placeholder={`${t('eg')} mail@growi.org`}
              defaultValue={adminAppContainer.state.fromAddress || ''}
              onChange={(e) => { adminAppContainer.changeFromAddress(e.target.value) }}
            />
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-xs-3 control-label">{t('admin:app_setting.smtp_settings')}</label>
          <div className="col-xs-4">
            <label>{t('admin:app_setting.host')}</label>
            <input
              className="form-control"
              type="text"
              defaultValue={adminAppContainer.state.smtpHost || ''}
              onChange={(e) => { adminAppContainer.changeSmtpHost(e.target.value) }}
            />
          </div>
          <div className="col-xs-2">
            <label>{t('admin:app_setting.port')}</label>
            <input
              className="form-control"
              defaultValue={adminAppContainer.state.smtpPort || ''}
              onChange={(e) => { adminAppContainer.changeSmtpPort(e.target.value) }}
            />
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-xs-3 col-xs-offset-3">
            <label>{t('admin:app_setting.user')}</label>
            <input
              className="form-control"
              type="text"
              defaultValue={adminAppContainer.state.SmtpUser || ''}
              onChange={(e) => { adminAppContainer.changeSmtpUser(e.target.value) }}
            />
          </div>
          <div className="col-xs-3">
            <label>{t('Password')}</label>
            <input
              className="form-control"
              type="password"
              defaultValue={adminAppContainer.state.smtpPassword || ''}
              onChange={(e) => { adminAppContainer.changeSmtpPassword(e.target.value) }}
            />
          </div>
        </div>

        <AdminUpdateButtonRow onClick={this.submitHandler} disabled={adminAppContainer.state.retrieveError != null} />
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
