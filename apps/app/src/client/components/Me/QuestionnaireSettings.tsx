import { useCallback, useEffect, useState, type JSX } from 'react';

import { LoadingSpinner } from '@growi/ui/dist/components';
import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { useSWRxIsQuestionnaireEnabled } from '~/features/questionnaire/client/stores/questionnaire';
import { useCurrentUser } from '~/stores-universal/context';

export const QuestionnaireSettings = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: currentUser, error: errorCurrentUser } = useCurrentUser();
  const { data: growiIsQuestionnaireEnabled } = useSWRxIsQuestionnaireEnabled();

  const [isQuestionnaireEnabled, setIsQuestionnaireEnabled] = useState(currentUser?.isQuestionnaireEnabled);

  const onChangeIsQuestionnaireEnabledHandler = useCallback(async () => {
    setIsQuestionnaireEnabled((prev) => !prev);
  }, []);

  const onClickUpdateIsQuestionnaireEnabledHandler = useCallback(async () => {
    try {
      await apiv3Put('/personal-setting/questionnaire-settings', {
        isQuestionnaireEnabled,
      });
      toastSuccess(t('toaster.update_successed', { target: t('questionnaire.settings'), ns: 'commons' }));
    } catch (err) {
      toastError(err);
    }
  }, [isQuestionnaireEnabled, t]);

  // Sync currentUser and state
  useEffect(() => {
    setIsQuestionnaireEnabled(currentUser?.isQuestionnaireEnabled);
  }, [currentUser?.isQuestionnaireEnabled]);

  const isLoadingCurrentUser = currentUser === undefined && errorCurrentUser === undefined;

  return (
    <>
      <h2 className="border-bottom pb-2 mb-4 fs-4">{t('questionnaire.settings')}</h2>

      {isLoadingCurrentUser && (
        <div className="text-muted text-center mb-5">
          <LoadingSpinner className="me-1 fs-3" />
        </div>
      )}

      <div className="container">
        {!isLoadingCurrentUser && (
          <div className="offset-md-3 col-md-6 text-start row">
            <div className="form-check form-switch">
              <span id="grw-questionnaire-settings-toggle-wrapper">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isQuestionnaireEnabled"
                  checked={growiIsQuestionnaireEnabled && isQuestionnaireEnabled}
                  onChange={onChangeIsQuestionnaireEnabledHandler}
                  disabled={!growiIsQuestionnaireEnabled}
                />
                <label className="form-label form-check-label" htmlFor="isQuestionnaireEnabled">
                  {t('questionnaire.enable_questionnaire')}
                </label>
              </span>
              {!growiIsQuestionnaireEnabled && (
                <UncontrolledTooltip placement="bottom" target="grw-questionnaire-settings-toggle-wrapper">
                  {t('questionnaire.disabled_by_admin')}
                </UncontrolledTooltip>
              )}
            </div>
            <p className="form-text text-muted small">{t('questionnaire.personal_settings_explanation')}</p>
          </div>
        )}
      </div>

      <div className="row my-3">
        <div className="offset-4 col-5">
          <span className="d-inline-block" id="grw-questionnaire-settings-update-btn-wrapper">
            <button
              data-testid="grw-questionnaire-settings-update-btn"
              type="button"
              className="btn btn-primary"
              onClick={onClickUpdateIsQuestionnaireEnabledHandler}
              disabled={!growiIsQuestionnaireEnabled}
              style={growiIsQuestionnaireEnabled ? {} : { pointerEvents: 'none' }}
            >
              {t('Update')}
            </button>
          </span>
          {!growiIsQuestionnaireEnabled && (
            <UncontrolledTooltip placement="bottom" target="grw-questionnaire-settings-update-btn-wrapper">
              {t('questionnaire.disabled_by_admin')}
            </UncontrolledTooltip>
          )}
        </div>
      </div>
    </>
  );
};
