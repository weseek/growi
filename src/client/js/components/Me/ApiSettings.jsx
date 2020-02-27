
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '../../util/apiNotification';
import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';


class ApiSettings extends React.Component {

  constructor(appContainer) {
    super();

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, personalContainer } = this.props;

    try {
      // TODO
      await personalContainer.retrievePersonalData();
      toastSuccess(t('toaster.update_successed', { target: t('personal_settings.update_password') }));
    }
    catch (err) {
      toastError(err);
    }

  }

  render() {
    const { t, personalContainer } = this.props;
    return (
      <React.Fragment>

        <div className="mb-5 container-fluid">
          <h2 className="border-bottom">{ t('API Token Settings') }</h2>
        </div>

        <div className="row mb-3">
          <label htmlFor="apiToken" className="col-xs-3 text-right">{t('Current API Token')}</label>
          <div className="col-xs-6">
            {personalContainer.state.apiToken != null
            ? (
              <input
                className="form-control"
                type="text"
                name="apiToken"
                value={personalContainer.state.apiToken}
                readOnly
              />
            )
            : (
              <p className="form-control-static">
                { t('page_me_apitoken.notice.apitoken_issued') }
              </p>
            )}
          </div>
        </div>


        <div className="row">
          <div className="col-xs-offset-3 col-xs-9">

            <p className="alert alert-warning">
              { t('page_me_apitoken.notice.update_token1') }<br />
              { t('page_me_apitoken.notice.update_token2') }
            </p>

          </div>
        </div>

        <div className="row my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.onClickSubmit}
            >
              {t('Update API Token')}
            </button>
          </div>
        </div>

      </React.Fragment>

    );
  }

}

const ApiSettingsWrapper = (props) => {
  return createSubscribedElement(ApiSettings, props, [AppContainer, PersonalContainer]);
};

ApiSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

export default withTranslation()(ApiSettingsWrapper);
