import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';

const logger = loggerFactory('growi:appSettings');

class MailSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isInitializeValueModalOpen: false,
    };

    this.emailInput = React.createRef();
    this.hostInput = React.createRef();
    this.portInput = React.createRef();
    this.userInput = React.createRef();
    this.passwordInput = React.createRef();

    this.openInitializeValueModal = this.openInitializeValueModal.bind(this);
    this.closeInitializeValueModal = this.closeInitializeValueModal.bind(this);
    this.submitFromAdressHandler = this.submitFromAdressHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.initialize = this.initialize.bind(this);
  }

  openInitializeValueModal() {
    this.setState({ isInitializeValueModalOpen: true });
  }

  closeInitializeValueModal() {
    this.setState({ isInitializeValueModalOpen: false });
  }

  async submitHandler() {
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

  async submitFromAdressHandler() {
    const { t, adminAppContainer } = this.props;

    try {
      await adminAppContainer.updateFromAdressHandler();
      toastSuccess(t('toaster.update_successed', { target: t('admin:app_setting.mail_settings') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  async initialize() {
    const { t, adminAppContainer } = this.props;

    try {
      const mailSettingParams = await adminAppContainer.initializeMailSettingHandler();
      toastSuccess(t('toaster.initialize_successed', { target: t('admin:app_setting.from_e-mail_address') }));
      // convert values to '' if value is null for overwriting values of inputs with refs
      this.emailInput.current.value = mailSettingParams.fromAddress || '';
      this.hostInput.current.value = mailSettingParams.smtpHost || '';
      this.portInput.current.value = mailSettingParams.smtpPort || '';
      this.userInput.current.value = mailSettingParams.smtpUser || '';
      this.passwordInput.current.value = mailSettingParams.smtpPassword || '';
      this.closeInitializeValueModal();
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
        <p className="card well">{t('admin:app_setting.smtp_used')} {t('admin:app_setting.smtp_but_aws')}<br />{t('admin:app_setting.neihter_of')}</p>
        <div className="row form-group mb-5">
          <label className="col-md-3 col-form-label text-left">{t('admin:app_setting.from_e-mail_address')}</label>
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
        <div className="row my-3">
          <div className="mx-auto">
            <button type="button" className="btn btn-primary" onClick={this.submitFromAdressHandler}>{ t('Update') }</button>
          </div>
        </div>
        <ul className="nav nav-tabs passport-settings mb-2" role="tablist">
          <li className="nav-item active">
            <a href="#mail-smtp" className="nav-link active" data-toggle="tab" role="tab">
              SMTP
            </a>
          </li>
          <li className="nav-item">
            <a href="#mail-ses" className="nav-link" data-toggle="tab" role="tab">
              SES(AWS)
            </a>
          </li>
        </ul>
        <div className="tab-content">
          <div id="mail-smtp" className="tab-pane active">
            <div className="alert alert-warning">AWSの設定が有効のため、SMTPでの送信は行われません</div>
            <div className="row form-group mb-5">
              <label className="col-md-3 col-form-label text-left">{t('admin:app_setting.smtp_settings')}</label>
              <div className="col-md-4">
                <label>{t('admin:app_setting.host')}</label>
                <input
                  className="form-control"
                  type="text"
                  ref={this.hostInput}
                  defaultValue={adminAppContainer.state.smtpHost || ''}
                  onChange={(e) => { adminAppContainer.changeSmtpHost(e.target.value) }}
                />
              </div>
              <div className="col-md-2">
                <label>{t('admin:app_setting.port')}</label>
                <input
                  className="form-control"
                  ref={this.portInput}
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
                  ref={this.userInput}
                  defaultValue={adminAppContainer.state.smtpUser || ''}
                  onChange={(e) => { adminAppContainer.changeSmtpUser(e.target.value) }}
                />
              </div>
              <div className="col-md-3">
                <label>{t('Password')}</label>
                <input
                  className="form-control"
                  type="password"
                  ref={this.passwordInput}
                  defaultValue={adminAppContainer.state.smtpPassword || ''}
                  onChange={(e) => { adminAppContainer.changeSmtpPassword(e.target.value) }}
                />
              </div>
            </div>

            <div className="row my-3">
              <div className="offset-5">
                <button type="button" className="btn btn-primary" onClick={this.submitHandler} disabled={adminAppContainer.state.retrieveError != null}>
                  { t('Update') }
                </button>
              </div>
              <div className="offset-1">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={this.openInitializeValueModal}
                  disabled={adminAppContainer.state.retrieveError != null}
                >
                  {t('admin:app_setting.initialize_mail_settings')}
                </button>
              </div>
            </div>
          </div>
          <div id="mail-ses" className="tab-pane" role="tabpanel">下記の AWS 設定から設定お願いします。</div>
        </div>


        <Modal isOpen={this.state.isInitializeValueModalOpen} toggle={this.closeInitializeValueModal} className="initialize-mail-settings">
          <ModalHeader tag="h4" toggle={this.closeInitializeValueModal} className="bg-danger text-light">
            {t('admin:app_setting.initialize_mail_modal_header')}
          </ModalHeader>
          <ModalBody>
            <div className="text-center mb-4">
              {t('admin:app_setting.confirm_to_initialize_mail_settings')}
            </div>
            <div className="text-center my-2">
              <button type="button" className="btn btn-outline-secondary mr-4" onClick={this.closeInitializeValueModal}>
                {t('Cancel')}
              </button>
              <button type="button" className="btn btn-danger" onClick={this.initialize}>
                {t('Reset')}
              </button>
            </div>
          </ModalBody>
        </Modal>
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
