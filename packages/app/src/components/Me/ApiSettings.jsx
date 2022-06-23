import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import PersonalContainer from '~/client/services/PersonalContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv3-client';

import { withUnstatedContainers } from '../UnstatedUtils';


class ApiSettings extends React.Component {

  constructor() {
    super();

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, personalContainer } = this.props;

    try {
      await apiv3Put('/personal-setting/api-token');

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
                  data-testid="grw-api-settings-input"
                  data-hide-in-vrt
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
              data-testid="grw-api-settings-update-button"
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

ApiSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

const ApiSettingsWrapperFC = (props) => {
  const { t } = useTranslation();
  return <ApiSettings t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const ApiSettingsWrapper = withUnstatedContainers(ApiSettingsWrapperFC, [PersonalContainer]);

export default ApiSettingsWrapper;
