
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '../../util/apiNotification';
import { withUnstatedContainers } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';

class BasicInfoSettings extends React.Component {

  constructor(appContainer) {
    super();

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async componentDidMount() {
    try {
      await this.props.personalContainer.retrievePersonalData();
    }
    catch (err) {
      toastError(err);
    }
  }

  async onClickSubmit() {
    const { t, personalContainer } = this.props;

    try {
      await personalContainer.updateBasicInfo();
      toastSuccess(t('toaster.update_successed', { target: t('Basic Info') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, personalContainer } = this.props;
    const { registrationWhiteList } = personalContainer.state;

    return (
      <Fragment>

        <div className="form-group row">
          <label htmlFor="userForm[name]" className="text-left text-md-right col-md-3 col-form-label">{t('Name')}</label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              name="userForm[name]"
              defaultValue={personalContainer.state.name}
              onChange={(e) => { personalContainer.changeName(e.target.value) }}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="userForm[email]" className="text-left text-md-right col-md-3 col-form-label">{t('Email')}</label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              name="userForm[email]"
              defaultValue={personalContainer.state.email}
              onChange={(e) => { personalContainer.changeEmail(e.target.value) }}
            />
            {registrationWhiteList.length !== 0 && (
              <div className="form-text text-muted">
                {t('page_register.form_help.email')}
                <ul>
                  {registrationWhiteList.map(data => <li key={data}><code>{data}</code></li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="form-group row">
          <label className="text-left text-md-right col-md-3 col-form-label">{t('Disclose E-mail')}</label>
          <div className="col-md-6">
            <div className="custom-control custom-radio custom-control-inline">
              <input
                type="radio"
                id="radioEmailShow"
                className="custom-control-input"
                name="userForm[isEmailPublished]"
                checked={personalContainer.state.isEmailPublished}
                onChange={() => { personalContainer.changeIsEmailPublished(true) }}
              />
              <label className="custom-control-label" htmlFor="radioEmailShow">{t('Show')}</label>
            </div>
            <div className="custom-control custom-radio custom-control-inline">
              <input
                type="radio"
                id="radioEmailHide"
                className="custom-control-input"
                name="userForm[isEmailPublished]"
                checked={!personalContainer.state.isEmailPublished}
                onChange={() => { personalContainer.changeIsEmailPublished(false) }}
              />
              <label className="custom-control-label" htmlFor="radioEmailHide">{t('Hide')}</label>
            </div>
          </div>
        </div>

        <div className="form-group row">
          <label className="text-left text-md-right col-md-3 col-form-label">{t('Language')}</label>
          <div className="col-md-6">
            <div className="custom-control custom-radio custom-control-inline">
              <input
                type="radio"
                id="radioLangEn"
                className="custom-control-input"
                name="userForm[lang]"
                checked={personalContainer.state.lang === 'en-US'}
                onChange={() => { personalContainer.changeLang('en-US') }}
              />
              <label className="custom-control-label" htmlFor="radioLangEn">{t('English')}</label>
            </div>
            <div className="custom-control custom-radio custom-control-inline">
              <input
                type="radio"
                id="radioLangJa"
                className="custom-control-input"
                name="userForm[lang]"
                checked={personalContainer.state.lang === 'ja'}
                onChange={() => { personalContainer.changeLang('ja') }}
              />
              <label className="custom-control-label" htmlFor="radioLangJa">{t('Japanese')}</label>
            </div>
            <div className="custom-control custom-radio custom-control-inline">
              <input
                type="radio"
                id="radioLangZh"
                className="custom-control-input"
                name="userForm[lang]"
                checked={personalContainer.state.lang === 'zh-CN'}
                onChange={() => { personalContainer.changeLang('zh-CN') }}
              />
              <label className="custom-control-label" htmlFor="radioLangZh">{t('Chinese')}</label>
            </div>
          </div>
        </div>

        <div className="row my-3">
          <div className="offset-4 col-5">
            <button type="button" className="btn btn-primary" onClick={this.onClickSubmit} disabled={personalContainer.state.retrieveError != null}>
              {t('Update')}
            </button>
          </div>
        </div>

      </Fragment>
    );
  }

}

const BasicInfoSettingsWrapper = withUnstatedContainers(BasicInfoSettings, [AppContainer, PersonalContainer]);

BasicInfoSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

export default withTranslation()(BasicInfoSettingsWrapper);
