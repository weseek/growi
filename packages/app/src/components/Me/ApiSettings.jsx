
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { withUnstatedContainers } from '../UnstatedUtils';

import AppContainer from '~/client/services/AppContainer';
import PersonalContainer from '~/client/services/PersonalContainer';


class ApiSettings extends React.Component {

  constructor(appContainer) {
    super();

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, appContainer, personalContainer } = this.props;

    try {
      await appContainer.apiv3Put('/personal-setting/api-token');

      await personalContainer.retrievePersonalData();
      toastSuccess(t('toaster.update_successed', { target: t('page_me_apitoken.api_token') }));
    }
    catch (err) {
      toastError(err);
    }

  }

  render() {
    const { t, personalContainer } = this.props;
    return (
      <React.Fragment>

        <h2 className="border-bottom my-4">{ t('API Token Settings') }</h2>

        <div className="row mb-3">
          <label htmlFor="apiToken" className="col-md-3 text-md-right">{t('Current API Token')}</label>
          <div className="col-md-6">
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
                <p>
                  { t('page_me_apitoken.notice.apitoken_issued') }
                </p>
              )}
          </div>
        </div>


        <div className="row">
          <div className="offset-lg-2 col-lg-7">

            <p className="alert alert-warning">
              { t('page_me_apitoken.notice.update_token1') }<br />
              { t('page_me_apitoken.notice.update_token2') }
            </p>

          </div>
        </div>

        <div className="row my-3">
          <div className="offset-4 col-5">
            <button
              type="button"
              className="btn btn-primary text-nowrap"
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

const ApiSettingsWrapper = withUnstatedContainers(ApiSettings, [AppContainer, PersonalContainer]);

ApiSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

export default withTranslation()(ApiSettingsWrapper);
