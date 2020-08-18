
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


import { toastSuccess, toastError } from '../../util/apiNotification';
import { withUnstatedContainers } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';


class PasswordSettings extends React.Component {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      retrieveError: null,
      oldPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      isPasswordSet: false,
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
    this.onChangeOldPassword = this.onChangeOldPassword.bind(this);

  }

  async componentDidMount() {
    const { appContainer } = this.props;

    try {
      const res = await appContainer.apiv3Get('/personal-setting/is-password-set');
      const { isPasswordSet } = res.data;
      this.setState({ isPasswordSet });
    }
    catch (err) {
      toastError(err);
    }

  }

  async onClickSubmit() {
    const { t, appContainer, personalContainer } = this.props;
    const { oldPassword, newPassword, newPasswordConfirm } = this.state;

    try {
      await appContainer.apiv3Put('/personal-setting/password', {
        oldPassword, newPassword, newPasswordConfirm,
      });
      this.setState({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
      await personalContainer.retrievePersonalData();
      toastSuccess(t('toaster.update_successed', { target: t('personal_settings.update_password') }));
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
    const { t } = this.props;
    const { newPassword, newPasswordConfirm } = this.state;
    const isIncorrectConfirmPassword = (newPassword !== newPasswordConfirm);

    return (
      <React.Fragment>
        { (!this.state.isPasswordSet) && (
          <div className="alert alert-warning">{ t('personal_settings.password_is_not_set') }</div>
        ) }

        <div className="container-fluid my-4">
          {(this.state.isPasswordSet)
            ? <h2 className="border-bottom">{t('personal_settings.update_password')}</h2>
          : <h2 className="border-bottom">{t('personal_settings.set_new_password')}</h2>}
        </div>
        {(this.state.isPasswordSet)
        && (
          <div className="row mb-3">
            <label htmlFor="oldPassword" className="col-md-3 text-md-right">{ t('personal_settings.current_password') }</label>
            <div className="col-md-5">
              <input
                className="form-control"
                type="password"
                name="oldPassword"
                value={this.state.oldPassword}
                onChange={(e) => { this.onChangeOldPassword(e.target.value) }}
              />
            </div>
          </div>
        )}
        <div className="row mb-3">
          <label htmlFor="newPassword" className="col-md-3 text-md-right">{t('personal_settings.new_password') }</label>
          <div className="col-md-5">
            <input
              className="form-control"
              type="password"
              name="newPassword"
              value={this.state.newPassword}
              onChange={(e) => { this.onChangeNewPassword(e.target.value) }}
            />
          </div>
        </div>
        <div className={`row mb-3 ${isIncorrectConfirmPassword && 'has-error'}`}>
          <label htmlFor="newPasswordConfirm" className="col-md-3 text-md-right">{t('personal_settings.new_password_confirm') }</label>
          <div className="col-md-5">
            <input
              className="form-control"
              type="password"
              name="newPasswordConfirm"
              value={this.state.newPasswordConfirm}
              onChange={(e) => { this.onChangeNewPasswordConfirm(e.target.value) }}
            />

            <p className="form-text text-muted">{t('page_register.form_help.password') }</p>
          </div>
        </div>

        <div className="row my-3">
          <div className="offset-5">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.onClickSubmit}
              disabled={this.state.retrieveError != null || isIncorrectConfirmPassword}
            >
              {t('Update')}
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  }

}


const PasswordSettingsWrapper = withUnstatedContainers(PasswordSettings, [AppContainer, PersonalContainer]);

PasswordSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

export default withTranslation()(PasswordSettingsWrapper);
