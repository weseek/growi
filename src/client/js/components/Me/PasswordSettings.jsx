
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


import { toastError } from '../../util/apiNotification';
import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';


class PasswordSettings extends React.Component {

  constructor(appContainer) {
    super();

    this.state = {
      oldPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
    this.onChangeOldPassword = this.onChangeOldPassword.bind(this);
  }

  async onClickSubmit() {

    try {
      // await personalContainer.updateBasicInfo();
      // TODO
      // toastSuccess(t('toaster.update_successed', { target: t('Basic Info') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  onChangeOldPassword(oldPassword) {
    this.setState({ oldPassword });
  }

  onChangeNewPassword(newPassword) {
    this.setState({ newPassword });
  }

  onChangeNewPasswordConfirm(newPasswordConfirm) {
    this.setState({ newPasswordConfirm });
  }


  render() {
    const { t, personalContainer } = this.props;

    return (
      <React.Fragment>
        <div className="mb-5 container-fluid">
          <h2 className="border-bottom">{t('personal_settings.update_password')}</h2>
        </div>
        <div className="row mb-3">
          <label htmlFor="oldPassword" className="col-xs-3 text-right">{ t('personal_settings.current_password') }</label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="password"
              name="oldPassword"
              value={this.state.oldPassword}
              onChange={(e) => { this.onChangeOldPassword(e.target.value) }}
            />
          </div>
        </div>
        <div className="row mb-3">
          <label htmlFor="newPassword" className="col-xs-3 text-right">{t('personal_settings.new_password') }</label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="password"
              name="newPassword"
              value={this.state.newPassword}
              onChange={(e) => { this.onChangeNewPassword(e.target.value) }}
            />
          </div>
        </div>
        <div className="row mb-3">
          <label htmlFor="newPasswordConfirm" className="col-xs-3 text-right">{t('personal_settings.new_password_confirm') }</label>
          <div className="col-xs-6">
            <input
              className="form-control col-xs-4"
              type="password"
              name="newPasswordConfirm"
              value={this.state.newPasswordConfirm}
              onChange={(e) => { this.onChangeNewPasswordConfirm(e.target.value) }}
            />

            <p className="help-block">{t('page_register.form_help.password') }</p>
          </div>
        </div>

        <div className="row my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <button type="button" className="btn btn-primary" onClick={this.onClickSubmit} disabled={personalContainer.state.retrieveError != null}>
              {t('Update')}
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  }

}


const PasswordSettingsWrapper = (props) => {
  return createSubscribedElement(PasswordSettings, props, [AppContainer, PersonalContainer]);
};

PasswordSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

export default withTranslation()(PasswordSettingsWrapper);
