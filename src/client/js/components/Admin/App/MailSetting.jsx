import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import SmtpSetting from './SmtpSetting';
import SesSetting from './SesSetting';

const logger = loggerFactory('growi:mailSettings');

class MailSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      transmissionMethods: ['smtp', 'ses'],
    };

    this.emailInput = React.createRef();
    this.hostInput = React.createRef();
    this.portInput = React.createRef();
    this.userInput = React.createRef();
    this.passwordInput = React.createRef();

    this.submitFromAdressHandler = this.submitFromAdressHandler.bind(this);
  }

  async submitFromAdressHandler() {
    const { t, adminAppContainer } = this.props;

    try {
      await adminAppContainer.updateMailSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('admin:app_setting.mail_settings') }));
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
        <div className="row form-group mb-5">
          <label className="col-md-3 col-form-label text-right">{t('admin:app_setting.from_e-mail_address')}</label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              ref={this.emailInput}
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
            {this.state.transmissionMethods.map((method) => {
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
