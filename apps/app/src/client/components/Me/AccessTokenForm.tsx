import React from 'react';

import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';


import type { IAccessTokenInfo } from '~/interfaces/access-token';
import type { Scope } from '~/interfaces/scope';
import { SCOPE } from '~/interfaces/scope';

const MAX_DESCRIPTION_LENGTH = 200;

type AccessTokenFormProps = {
  submitHandler: (info: IAccessTokenInfo) => Promise<void>;
}

type FormInputs = {
  expiredAt: string;
  description: string;
  // TODO: Implement scope selection
  scopes: Scope[];
}

// TODO: Implement scope selection
export const AccessTokenForm = React.memo((props: AccessTokenFormProps): JSX.Element => {
  const { submitHandler } = props;
  const { t } = useTranslation();

  const defaultExpiredAt = new Date();
  defaultExpiredAt.setMonth(defaultExpiredAt.getMonth() + 1);
  const defaultExpiredAtStr = defaultExpiredAt.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormInputs>({
    defaultValues: {
      expiredAt: defaultExpiredAtStr,
      description: '',
    },
  });

  const onSubmit = (data: FormInputs) => {
    const expiredAtDate = new Date(data.expiredAt);
    const scopes: Scope[] = data.scopes ? data.scopes : [];

    submitHandler({
      expiredAt: expiredAtDate,
      description: data.description,
      scopes,
    });
  };

  return (
    <div className="card mt-3 mb-4">
      <div className="card-header">{t('page_me_access_token.form.title')}</div>
      <div className="card-body">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="expiredAt" className="form-label">{t('page_me_access_token.expiredAt')}</label>
            <div className="row">
              <div className="col-16 col-sm-4 col-md-4 col-lg-3">
                <div className="input-group">
                  <input
                    type="date"
                    className={`form-control ${errors.expiredAt ? 'is-invalid' : ''}`}
                    data-testid="grw-accesstoken-input-expiredAt"
                    min={todayStr}
                    {...register('expiredAt', {
                      required: t('input_validation.message.required', { param: t('page_me_access_token.expiredAt') }),
                      validate: (value) => {
                        const date = new Date(value);
                        const now = new Date();
                        return date > now || 'Expiration date must be in the future';
                      },
                    })}
                  />
                </div>
                {errors.expiredAt && (
                  <div className="invalid-feedback d-block">
                    {errors.expiredAt.message}
                  </div>
                )}
              </div>
            </div>
            <div className="form-text">{t('page_me_access_token.form.expiredAt_desc')}</div>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">{t('page_me_access_token.description')}</label>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows={3}
              data-testid="grw-accesstoken-textarea-description"
              {...register('description', {
                required: t('input_validation.message.required', { param: t('page_me_access_token.description') }),
                maxLength: {
                  value: MAX_DESCRIPTION_LENGTH,
                  message: t('page_me_access_token.form.description_max_length', { length: MAX_DESCRIPTION_LENGTH }),
                },
              })}
            />
            {errors.description && (
              <div className="invalid-feedback">
                {errors.description.message}
              </div>
            )}
            <div className="form-text">{t('page_me_access_token.form.description_desc')}</div>
          </div>

          <div className="mb-3">
            <label htmlFor="scope" className="form-label">{t('page_me_access_token.scope')}</label>
            <div className="form-text mb-2">{t('page_me_access_token.form.scope_desc')}</div>
            <div className="form-text mb-2">
              <input
                type="checkbox"
                id="scope-read-user"
                value={SCOPE.READ.USER.ALL}
                {...register('scopes')}
              />
              <label htmlFor="scope-read-user" className="ms-2">Read User</label>
            </div>
            <div className="form-text mb-2">
              <input
                type="checkbox"
                id="scope-write-user"
                value={SCOPE.WRITE.USER.ALL}
                {...register('scopes')}
              />
              <label htmlFor="scope-write-user" className="ms-2">Write User</label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            data-testid="grw-accesstoken-create-button"
            disabled={!isValid}
          >
            {t('page_me_access_token.create_token')}
          </button>
        </form>
      </div>
    </div>
  );
});
AccessTokenForm.displayName = 'AccessTokenForm';
