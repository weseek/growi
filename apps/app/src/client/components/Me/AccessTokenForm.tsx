import type { FormEventHandler } from 'react';
import React from 'react';

import { useTranslation } from 'next-i18next';

const MAX_DESCRIPTION_LENGTH = 250;

type AccessTokenFormProps = {
  submitHandler: (info: {
    expiredAt: Date,
    scope: string[],
    description: string,
  }) => Promise<void>;
}

// TODO: Implement scope selection
export const AccessTokenForm = React.memo((props: AccessTokenFormProps): JSX.Element => {
  const { submitHandler } = props;
  const { t } = useTranslation();

  const defaultExpiredAt = new Date();
  defaultExpiredAt.setMonth(defaultExpiredAt.getMonth() + 1);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const expiredAtDate = new Date(form.get('expiredAt') as string);
    const description = form.get('description') as string;
    const scope = []; // form.getAll('scope') as string[];

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
                    name="expiredAt"
                    min={new Date().toISOString().split('T')[0]}
                    required
                    defaultValue={defaultExpiredAt.toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
            <div className="form-text">{t('Select when this access token should expire')}</div>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">{t('Description')}</label>
            <textarea
              className="form-control"
              name="description"
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={3}
              required
              defaultValue=""
            />
            <div className="form-text">{t('Provide a description to help you identify this token later')}</div>
          </div>

          <div className="mb-3">
            <label htmlFor="scope" className="form-label">{t('Scope')}</label>
            <div className="form-text mb-2">(TODO: Implement scope selection)</div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="readScope"
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
            data-testid="create-access-token-button"
          >
            {t('Create Token')}
          </button>
        </form>
      </div>
    </div>
  );
});
AccessTokenForm.displayName = 'AccessTokenForm';
