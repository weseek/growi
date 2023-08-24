import {
  useState, useCallback, useEffect,
} from 'react';

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
    setIsQuestionnaireEnabled(prev => !prev);
  }, []);

  const [isAppSiteUrlHashed, setIsAppSiteUrlHashed] = useState(data?.isAppSiteUrlHashed);
  const onChangeisAppSiteUrlHashedHandler = useCallback(() => {
    setIsAppSiteUrlHashed(prev => !prev);
  }, []);

  const onSubmitHandler = useCallback(async() => {
    try {
      await apiv3Put('/app-settings/questionnaire-settings', {
        isQuestionnaireEnabled,
        isAppSiteUrlHashed,
      });
      toastSuccess(t('commons:toaster.update_successed', { target: t('app_setting.questionnaire_settings') }));
    }
    catch (err) {
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
      <p className="card well">
        <div className="mb-4">{t('app_setting.questionnaire_settings_explanation')}</div>
        <span>
          <div className="mb-2">
            <span className="text-info mr-2"><i className="icon-info icon-fw"></i>{t('app_setting.about_data_sent')}</span>
            <a href={t('app_setting.docs_link')} rel="noreferrer" target="_blank" className="d-inline">
              {t('app_setting.learn_more')} <i className="icon-share-alt"></i>
            </a>
          </div>
          {t('app_setting.other_info_will_be_sent')}<br />
          {t('app_setting.we_will_use_the_data_to_improve_growi')}
        </span>
      </p>

      {isLoading && (
        <div className="text-muted text-center mb-5">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1" />
        </div>
      )}

      {!isLoading && (
        <>
          <div className="row my-3">
            <div className="form-check form-switch form-check-info col-md-5 offset-md-5">
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

          <div className="row my-4">
            <div className="form-check form-check-info col-md-5 offset-md-5">
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
              <p className="form-text text-muted small">
                {t('app_setting.url_anonymization_explanation')}
              </p>
            </div>
          </div>

          <AdminUpdateButtonRow onClick={onSubmitHandler} />
        </>
      )}
    </div>
  );
};

export default QuestionnaireSettings;
