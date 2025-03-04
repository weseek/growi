import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { apiv3Delete, apiv3Post } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';


const ApiSettings = React.memo((): JSX.Element => {

  const { t } = useTranslation();
  // const { data: personalSettingsData } = usePersonalSettings();
  const [newAccessToken, setNewAccessToken] = React.useState<string | null>(null);

  const submitHandler = useCallback(async() => {

    try {
      await apiv3Delete('/personal-setting/access-token/all');
      const expiredAt = new Date('2099-12-31T23:59:59.999Z');
      const result = await apiv3Post('/personal-setting/access-token', { expiredAt });
      setNewAccessToken(result.data.token);

      toastSuccess(t('toaster.update_successed', { target: t('page_me_apitoken.api_token'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }

  }, [t]);

  return (
    <>

      <h2 className="border-bottom pb-2 my-4 fs-4">{ t('API Token Settings') }</h2>

      <div className="row mb-3">
        <label htmlFor="apiToken" className="col-md-3 text-md-end col-form-label">{t('Current API Token')}</label>
        <div className="col-md-6">
          {newAccessToken != null
            ? (
              <input
                data-testid="grw-api-settings-input"
                data-vrt-blackout
                className="form-control"
                type="text"
                name="apiToken"
                value={newAccessToken}
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

});

ApiSettings.displayName = 'ApiSettings';

export default ApiSettings;
