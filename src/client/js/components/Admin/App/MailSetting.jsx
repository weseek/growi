import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import SmtpSetting from './SmtpSetting';
import SesSetting from './SesSetting';


function MailSetting(props) {
  const { t, adminAppContainer } = props;
  const transmissionMethods = ['smtp', 'ses'];

  return (
    <React.Fragment>
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
        <div className="col-md-6">
          {transmissionMethods.map((method) => {
              return (
                <div key={method} className="custom-control custom-radio custom-control-inline">
                  <input
                    type="radio"
                    className="custom-control-input"
                    name="transmission-method"
                    id={`transmission-nethod-radio-${method}`}
                    checked={adminAppContainer.state.transmissionMethod === method}
                    onChange={(e) => {
                    adminAppContainer.changeTransmissionMethod(method);
                  }}
                  />
                  <label className="custom-control-label" htmlFor={`transmission-nethod-radio-${method}`}>{method}</label>
                </div>
              );
            })}
        </div>
      </div>
      {adminAppContainer.state.transmissionMethod === 'smtp' && <SmtpSetting />}
      {adminAppContainer.state.transmissionMethod === 'ses' && <SesSetting />}
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
