import type { FormEventHandler } from 'react';
import React from 'react';

import { useTranslation } from 'next-i18next';

import type { IAccessTokenInfo } from '~/interfaces/access-token';

const MAX_DESCRIPTION_LENGTH = 200;

type AccessTokenFormProps = {
  submitHandler: (info: IAccessTokenInfo) => Promise<void>;
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
    const scope = []; // TODO: Implement scope selection

    submitHandler({
      expiredAt: expiredAtDate,
      description,
      scope,
    });
  };

  return (
    <div className="card mt-3 mb-4">
      <div className="card-header">{t('page_me_access_token.form.title')}</div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="expiredAt" className="form-label">{t('page_me_access_token.expiredAt')}</label>
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
            <div className="form-text">{t('page_me_access_token.form.expiredAt_desc')}</div>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">{t('page_me_access_token.description')}</label>
            <textarea
              className="form-control"
              name="description"
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={3}
              required
              defaultValue=""
            />
            <div className="form-text">{t('page_me_access_token.form.description_desc')}</div>
          </div>

          <div className="mb-3">
            <label htmlFor="scope" className="form-label">{t('page_me_access_token.scope')}</label>
            <div className="form-text mb-2">{t('page_me_access_token.form.scope_desc')}</div>
            <div className="form-text mb-2">(TBD)</div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            data-testid="create-access-token-button"
          >
            {t('page_me_access_token.create_token')}
          </button>
        </form>
      </div>
    </div>
  );
});
AccessTokenForm.displayName = 'AccessTokenForm';
