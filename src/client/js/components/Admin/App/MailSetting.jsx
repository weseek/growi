import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '../../../util/apiNotification';
import { withUnstatedContainers } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import SmtpSetting from './SmtpSetting';
import SesSetting from './SesSetting';


function MailSetting(props) {
  const { t, adminAppContainer } = props;

  const transmissionMethods = ['smtp', 'ses'];

  async function submitHandler() {
    const { t } = props;

    try {
      await adminAppContainer.updateMailSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('admin:app_setting.ses_settings') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  async function sendTestEmailHandler() {
    const { adminAppContainer } = props;
    try {
      await adminAppContainer.sendTestEmail();
      toastSuccess(t('admin:app_setting.success_to_send_test_email'));
    }
    catch (err) {
      toastError(err);
    }
  }


  return (
    <React.Fragment>
      {!adminAppContainer.state.isMailerSetup && (
        <div className="alert alert-danger"><i className="icon-exclamation"></i> {t('admin:app_setting.mailer_is_not_set_up')}</div>
      )}
      <div className="row form-group mb-5">
        <label className="col-md-3 col-form-label text-right">{t('admin:app_setting.from_e-mail_address')}</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            placeholder={`${t('eg')} mail@growi.org`}
            defaultValue={adminAppContainer.state.fromAddress || ''}
            onChange={(e) => { adminAppContainer.changeFromAddress(e.target.value) }}
          />
        </div>
      </div>

      <div className="row form-group mb-5">
        <label className="text-left text-md-right col-md-3 col-form-label">
          {t('admin:app_setting.transmission_method')}
        </label>
        <div className="col-md-6 py-2">
          {transmissionMethods.map((method) => {
              return (
                <div key={method} className="custom-control custom-radio custom-control-inline">
                  <input
                    type="radio"
                    className="custom-control-input"
                    name="transmission-method"
                    id={`transmission-method-radio-${method}`}
                    checked={adminAppContainer.state.transmissionMethod === method}
                    onChange={(e) => {
                    adminAppContainer.changeTransmissionMethod(method);
                  }}
                  />
                  <label className="custom-control-label" htmlFor={`transmission-method-radio-${method}`}>{t(`admin:app_setting.${method}_label`)}</label>
                </div>
              );
            })}
        </div>
      </div>

      {adminAppContainer.state.transmissionMethod === 'smtp' && <SmtpSetting />}
      {adminAppContainer.state.transmissionMethod === 'ses' && <SesSetting />}

      <div className="row my-3">
        <div className="mx-auto">
          <button type="button" className="btn btn-primary" onClick={submitHandler} disabled={adminAppContainer.state.retrieveError != null}>
            { t('Update') }
          </button>
          {adminAppContainer.state.transmissionMethod === 'smtp' && (
          <button type="button" className="btn btn-secondary ml-4" onClick={sendTestEmailHandler}>
            {t('admin:app_setting.send_test_email')}
          </button>
          )}
        </div>
      </div>
    </React.Fragment>
  );

}

/**
 * Wrapper component for using unstated
 */
const MailSettingWrapper = withUnstatedContainers(MailSetting, [AppContainer, AdminAppContainer]);

MailSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(MailSettingWrapper);
