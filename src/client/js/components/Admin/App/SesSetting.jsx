
import React from 'react';
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

  async function submitHandler() {
    const { t } = props;

    try {
      await adminAppContainer.updateSesSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('admin:app_setting.ses_settings') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  return (
    <React.Fragment>
      <div id="mail-smtp" className="tab-pane active mt-5">
        <label className="col-md-3 col-form-label text-left mb-3">{t('admin:app_setting.ses_settings')}</label>

        <div className="row form-group">
          <label className="text-left text-md-right col-md-3 col-form-label">
            Access key ID
          </label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              defaultValue={adminAppContainer.state.sesAccessKeyId || ''}
              onChange={(e) => {
                adminAppContainer.changeSesAccessKeyId(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="row form-group">
          <label className="text-left text-md-right col-md-3 col-form-label">
            Secret access key
          </label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              defaultValue={adminAppContainer.state.sesSecretAccessKey || ''}
              onChange={(e) => {
                adminAppContainer.changeSesSecretAccessKey(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="row my-3">
          <div className="mx-auto">
            <button type="button" className="btn btn-primary" onClick={submitHandler} disabled={adminAppContainer.state.retrieveError != null}>
              { t('Update') }
            </button>
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
