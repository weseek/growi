import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import {
  apiv3Delete, apiv3Get, apiv3Post, apiv3Put,
} from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { usePersonalSettings, useSWRxPersonalSettings, useSWRxAccessToken } from '~/stores/personal-settings';


const ApiTokenSettings = React.memo((): JSX.Element => {

  const { t } = useTranslation();
  const { mutate: mutateDatabaseData } = useSWRxPersonalSettings();
  const { data: personalSettingsData } = usePersonalSettings();

  const submitHandler = useCallback(async() => {

    try {
      await apiv3Put('/personal-setting/api-token');
      mutateDatabaseData();

      toastSuccess(t('toaster.update_successed', { target: t('page_me_apitoken.api_token'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }

  }, [mutateDatabaseData, t]);

  return (
    <>
      <div className="row mb-3">
        <label htmlFor="apiToken" className="col-md-3 text-md-end col-form-label">{t('Current API Token')}</label>
        <div className="col-md-6">
          {personalSettingsData?.apiToken != null
            ? (
              <input
                data-testid="grw-api-settings-input"
                data-vrt-blackout
                className="form-control"
                type="text"
                name="apiToken"
                value={personalSettingsData.apiToken}
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

type AccessTokenFormProps = {
  submitHandler: (info: {
    expiredAt: Date,
    scope: string[],
    description: string,
  }) => Promise<void>;
}

const AccessTokenForm = React.memo((props: AccessTokenFormProps): JSX.Element => {
  const { submitHandler } = props;
  const { t } = useTranslation();
  const [expiredAt, setExpiredAt] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [scope, setScope] = React.useState<string[]>(['read']); // Default scope

  const descriptionCharsLeft = 200 - description.length;
  const isDescriptionValid = description.length > 0 && description.length <= 200;
  const isFormValid = expiredAt && isDescriptionValid;

  // Get current date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  // Calculate date 1 year from now for default expiration
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const defaultExpiry = oneYearFromNow.toISOString().split('T')[0];

  // Set default expiry date when component mounts
  React.useEffect(() => {
    setExpiredAt(defaultExpiry);
  }, [defaultExpiry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert the date string to a Date object
    const expiredAtDate = new Date(expiredAt);

    // Call the parent's submitHandler
    submitHandler({
      expiredAt: expiredAtDate,
      description,
      scope,
    });
  };

  return (
    <div className="card mt-3 mb-4">
      <div className="card-header">{t('Create New Access Token')}</div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="expiredAt" className="form-label">{t('Expiration Date')}</label>
            <input
              type="date"
              className="form-control"
              id="expiredAt"
              value={expiredAt}
              min={today}
              onChange={e => setExpiredAt(e.target.value)}
              required
            />
            <div className="form-text">{t('Select when this access token should expire')}</div>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">{t('Description')}</label>
            <textarea
              className={`form-control ${!isDescriptionValid && description.length > 0 ? 'is-invalid' : ''}`}
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              required
            />
            <div className={`form-text d-flex justify-content-end ${descriptionCharsLeft < 20 ? 'text-warning' : ''}`}>
              {descriptionCharsLeft} {t('characters left')}
            </div>
            <div className="form-text">{t('Provide a description to help you identify this token later')}</div>
          </div>

          <div className="mb-3">
            <label htmlFor="scope" className="form-label">{t('Scope')}</label>
            <div className="form-text mb-2">{t('(TODO: Implement scope selection)')}</div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="readScope"
                checked={scope.includes('read')}
                onChange={() => {
                  // Placeholder for future implementation
                  // This would toggle the 'read' scope
                }}
                disabled
              />
              <label className="form-check-label" htmlFor="readScope">
                {t('Read')}
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isFormValid}
            data-testid="create-access-token-button"
          >
            {t('Create Token')}
          </button>
        </form>
      </div>
    </div>
  );
});

/**
 * TODO: support managing multiple access tokens.
 */
const AccessTokenSettings = React.memo((): JSX.Element => {

  const { t } = useTranslation();

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const {
    data: accessTokens, mutate, generateAccessToken, deleteAccessToken, deleteAllAccessTokens,
  } = useSWRxAccessToken();


  // TODO: model で共通化
  type GenerateAccessTokenInfo = {
    expiredAt: Date,
    scope: string[],
    description: string,
  }
  const submitHandler = useCallback(async(info: GenerateAccessTokenInfo) => {
    try {
      await generateAccessToken(info);
      mutate();
      setIsOpen(false); // Close form after successful submission

      toastSuccess(t('toaster.update_successed', { target: t('page_me_access_token.access_token'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [t, generateAccessToken, mutate, setIsOpen]);

  const deleteHandler = useCallback(async(tokenId: string) => {
    try {
      await deleteAccessToken(tokenId);
      mutate();
      toastSuccess(t('toaster.remove_access_token_success', { ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [deleteAccessToken, mutate, t]);

  return (
    <>
      <div className="container p-0">
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th></th>
                <th>description</th>
                <th>expiredAt</th>
                <th>scope</th>
                <th>action</th>
              </tr>
            </thead>
            <tbody>
              {(accessTokens == null || accessTokens.length === 0)
                ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      {t('No access tokens found')}
                    </td>
                  </tr>
                )
                : (
                  <>{
                    accessTokens.map(token => (
                      <tr key={token._id}>
                        <td>{token._id.substring(0, 10)}</td>
                        <td>{token.description}</td>
                        <td>{token.expiredAt.toString()}</td>
                        <td>{token.scope.join(', ')}</td>
                        <td>
                          <button
                            className="btn btn-danger"
                            type="button"
                            onClick={() => deleteHandler(token._id)}
                          >
                            {t('Delete')}
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                  </>
                )}
            </tbody>
          </table>
        </div>

        <button
          className="btn btn-outline-secondary d-block mx-auto px-5"
          type="button"
          onClick={toggleOpen}
          data-testid="btn-sharelink-toggleform"
        >
          {isOpen ? t('Close') : t('New')}
        </button>
        {isOpen && <AccessTokenForm submitHandler={submitHandler} />}

      </div>
    </>
  );
});

const ApiSettings = React.memo((): JSX.Element => {

  const { t } = useTranslation();

  return (
    <>
      <h3 className="border-bottom pb-2 my-4 fs-5">{ t('API Token Settings') }</h3>
      <ApiTokenSettings />

      <h3 className="border-bottom pb-2 my-4 fs-5">{ t('Access Token Settings') }</h3>
      <AccessTokenSettings />
    </>
  );
});

ApiSettings.displayName = 'ApiSettings';

export default ApiSettings;
