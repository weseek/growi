import React from 'react';

import { useTranslation } from 'react-i18next';

import PersonalContainer from '~/client/services/PersonalContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv3-client';
import { usePersonalSettingsInfo } from '~/stores/personal-settings';

import { withUnstatedContainers } from '../UnstatedUtils';

type Props = {
  personalContainer: PersonalContainer,
}

const ApiSettings = (props: Props) => {

  const { t } = useTranslation();
  const { data: personalSettingsInfoData } = usePersonalSettingsInfo();
  const { personalContainer } = props;

  const submitHandler = async() => {

    try {
      await apiv3Put('/personal-setting/api-token');

      await personalContainer.retrievePersonalData();
      toastSuccess(t('toaster.update_successed', { target: t('page_me_apitoken.api_token') }));
    }
    catch (err) {
      toastError(err);
    }

  };

  return (
    <>

      <h2 className="border-bottom my-4">{ t('API Token Settings') }</h2>

      <div className="row mb-3">
        <label htmlFor="apiToken" className="col-md-3 text-md-right">{t('Current API Token')}</label>
        <div className="col-md-6">
          {personalSettingsInfoData?.apiToken != null
            ? (
              <input
                data-testid="grw-api-settings-input"
                data-hide-in-vrt
                className="form-control"
                type="text"
                name="apiToken"
                value={personalSettingsInfoData.apiToken}
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
            onClick={submitHandler}
          >
            {t('Update API Token')}
          </button>
        </div>
      </div>

    </>

  );

};


/**
 * Wrapper component for using unstated
 */
const ApiSettingsWrapper = withUnstatedContainers(ApiSettings, [PersonalContainer]);

export default ApiSettingsWrapper;
