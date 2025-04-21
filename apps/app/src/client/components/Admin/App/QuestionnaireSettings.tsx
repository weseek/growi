import { useState, useCallback, useEffect, type JSX } from 'react';

import { LoadingSpinner } from '@growi/ui/dist/components';
import { useTranslation } from 'next-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useSWRxAppSettings } from '~/stores/admin/app-settings';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const QuestionnaireSettings = (): JSX.Element => {
  const { t } = useTranslation(['admin', 'commons']);

  const { data, error, mutate } = useSWRxAppSettings();

  const [isQuestionnaireEnabled, setIsQuestionnaireEnabled] = useState(data?.isQuestionnaireEnabled);
  const onChangeIsQuestionnaireEnabledHandler = useCallback(() => {
    setIsQuestionnaireEnabled((prev) => !prev);
  }, []);

  const [isAppSiteUrlHashed, setIsAppSiteUrlHashed] = useState(data?.isAppSiteUrlHashed);
  const onChangeisAppSiteUrlHashedHandler = useCallback(() => {
    setIsAppSiteUrlHashed((prev) => !prev);
  }, []);

  const onSubmitHandler = useCallback(async () => {
    try {
      await apiv3Put('/app-settings/questionnaire-settings', {
        isQuestionnaireEnabled,
        isAppSiteUrlHashed,
      });
      toastSuccess(t('commons:toaster.update_successed', { target: t('app_setting.questionnaire_settings') }));
    } catch (err) {
      toastError(err);
    }
    mutate();
  }, [isAppSiteUrlHashed, isQuestionnaireEnabled, mutate, t]);

  // Sync SWR value and state
  useEffect(() => {
    setIsQuestionnaireEnabled(data?.isQuestionnaireEnabled);
    setIsAppSiteUrlHashed(data?.isAppSiteUrlHashed);
  }, [data, data?.isAppSiteUrlHashed, data?.isQuestionnaireEnabled]);

  const isLoading = data === undefined && error === undefined;

  return (
    <div id="questionnaire-settings" className="mb-5">
      <p className="card custom-card bg-info-subtle">
        <div className="mb-3">{t('app_setting.questionnaire_settings_explanation')}</div>
        <span>
          <div className="mb-2">
            <span className="text-info me-2">
              <span className="material-symbols-outlined">info</span>
              {t('app_setting.about_data_sent')}
            </span>
            <a href={t('app_setting.docs_link')} rel="noreferrer" target="_blank" className="d-inline">
              {t('app_setting.learn_more')} <span className="material-symbols-outlined">share</span>
            </a>
          </div>
          {t('app_setting.other_info_will_be_sent')}
          <br />
          {t('app_setting.we_will_use_the_data_to_improve_growi')}
        </span>
      </p>

      {isLoading && (
        <div className="text-muted text-center mb-5">
          <LoadingSpinner className="me-1 fs-3" />
        </div>
      )}

      {!isLoading && (
        <>
          <div className="my-4 row">
            <label className="text-start text-md-end col-md-3 col-form-label"></label>

            <div className="col-md-6">
              <div className="form-check form-switch form-check-info">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isQuestionnaireEnabled"
                  checked={isQuestionnaireEnabled}
                  onChange={onChangeIsQuestionnaireEnabledHandler}
                />
                <label className="form-label form-check-label" htmlFor="isQuestionnaireEnabled">
                  {t('app_setting.enable_questionnaire')}
                </label>
              </div>
            </div>
          </div>

          <div className="my-4 row">
            <label className="text-start text-md-end col-md-3 col-form-label"></label>

            <div className="col-md-6">
              <div className="form-check form-check-info">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isAppSiteUrlHashed"
                  checked={isAppSiteUrlHashed}
                  onChange={onChangeisAppSiteUrlHashedHandler}
                  disabled={!isQuestionnaireEnabled}
                />
                <label className="form-label form-check-label" htmlFor="isAppSiteUrlHashed">
                  {t('app_setting.anonymize_app_site_url')}
                </label>
                <p className="form-text text-muted small">{t('app_setting.url_anonymization_explanation')}</p>
              </div>
            </div>
          </div>

          <AdminUpdateButtonRow onClick={onSubmitHandler} />
        </>
      )}
    </div>
  );
};

export default QuestionnaireSettings;
