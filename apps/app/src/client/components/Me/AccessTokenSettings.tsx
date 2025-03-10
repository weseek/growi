import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import CopyToClipboard from 'react-copy-to-clipboard';

import { toastSuccess, toastError } from '~/client/util/toastr';
import { AccessToken } from '~/interfaces/access-token';
import { useSWRxAccessToken } from '~/stores/personal-settings';


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
            <div className="row">
              <div className="col-16 col-sm-4 col-md-4 col-lg-3">
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control"
                    id="expiredAt"
                    value={expiredAt}
                    min={today}
                    onChange={e => setExpiredAt(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
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


export const AccessTokenSettings = React.memo((): JSX.Element => {

  const { t } = useTranslation();

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // State to store the newly generated token
  const [newToken, setNewToken] = React.useState<string | null>(null);

  const {
    data: accessTokens, mutate, generateAccessToken, deleteAccessToken, deleteAllAccessTokens,
  } = useSWRxAccessToken();

  // Function to hide the token display
  const closeTokenDisplay = useCallback(() => {
    setNewToken(null);
  }, []);

  // Handle successful copy
  const handleCopySuccess = useCallback(() => {
    toastSuccess(t('Copied to clipboard'));
  }, [t]);

  // TODO: model で共通化
  type GenerateAccessTokenInfo = {
    expiredAt: Date,
    scope: string[],
    description: string,
  }
  const submitHandler = useCallback(async(info: GenerateAccessTokenInfo) => {
    try {
      const result = await generateAccessToken(info);
      mutate();
      setIsOpen(false); // Close form after successful submission

      // Store the newly generated token to display to the user
      if (result?.token) {
        setNewToken(result.token);
      }

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
        {/* Token Display Area (non-modal) */}
        {newToken && (
          <div className="alert alert-warning mb-4" role="alert">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">
                <i className="fa fa-exclamation-triangle me-2" aria-hidden="true"></i>
                {t('New Access Token')}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeTokenDisplay}
                aria-label="Close"
              >
              </button>
            </div>

            <p className="fw-bold mb-2">{t('This token will only be displayed once. Please save it securely.')}</p>

            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control font-monospace"
                value={newToken}
                readOnly
                data-vrt-blackout
              />
              <CopyToClipboard text={newToken} onCopy={handleCopySuccess}>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                >
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
              </CopyToClipboard>
            </div>
          </div>
        )}

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

AccessTokenSettings.displayName = 'AccessTokenSettings';
