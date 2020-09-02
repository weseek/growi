
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import { withLoadingSppiner } from '../../SuspenseUtils';


import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';

const logger = loggerFactory('growi:smtpSettings');


function SmtpSetting(props) {
  const { adminAppContainer, t } = props;

  const hostInput = useRef();
  const portInput = useRef();
  const userInput = useRef();
  const passwordInput = useRef();

  async function submitHandler() {
    const { t, adminAppContainer } = props;

    try {
      await adminAppContainer.updateSmtpSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('admin:app_setting.smtp_settings') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  async function sendTestEmailhandler() {
    const { adminAppContainer } = props;
    try {
      await adminAppContainer.sendTestEmail();
      toastSuccess('success to send test e-mail');
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  return (
    <React.Fragment>
      <div id="mail-smtp" className="tab-pane active mt-5">
        <div className="row form-group mb-5">
          <label className="col-md-3 col-form-label text-left">{t('admin:app_setting.smtp_settings')}</label>
          <div className="col-md-4">
            <label>{t('admin:app_setting.host')}</label>
            <input
              className="form-control"
              type="text"
              ref={hostInput}
              defaultValue={adminAppContainer.state.smtpHost || ''}
              onChange={(e) => { adminAppContainer.changeSmtpHost(e.target.value) }}
            />
          </div>
          <div className="col-md-2">
            <label>{t('admin:app_setting.port')}</label>
            <input
              className="form-control"
              ref={portInput}
              defaultValue={adminAppContainer.state.smtpPort || ''}
              onChange={(e) => { adminAppContainer.changeSmtpPort(e.target.value) }}
            />
          </div>
        </div>

        <div className="row form-group mb-5">
          <div className="col-md-3 offset-md-3">
            <label>{t('admin:app_setting.user')}</label>
            <input
              className="form-control"
              type="text"
              ref={userInput}
              defaultValue={adminAppContainer.state.smtpUser || ''}
              onChange={(e) => { adminAppContainer.changeSmtpUser(e.target.value) }}
            />
          </div>
          <div className="col-md-3">
            <label>{t('Password')}</label>
            <input
              className="form-control"
              type="password"
              ref={passwordInput}
              defaultValue={adminAppContainer.state.smtpPassword || ''}
              onChange={(e) => { adminAppContainer.changeSmtpPassword(e.target.value) }}
            />
          </div>
        </div>

        <div className="row my-3">
          <div className="offset-5">
            <button type="button" className="btn btn-primary" onClick={submitHandler} disabled={adminAppContainer.state.retrieveError != null}>
              { t('Update') }
            </button>
          </div>
          <div className="offset-1">
            <button type="button" className="btn btn-secondary" onClick={sendTestEmailhandler}>send test e-mail</button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

/**
 * Wrapper component for using unstated
 */
const SmtpSettingWrapper = withUnstatedContainers(withLoadingSppiner(SmtpSetting), [AppContainer, AdminAppContainer]);

SmtpSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(SmtpSettingWrapper);
