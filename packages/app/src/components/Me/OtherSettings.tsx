import {
  useState, useEffect, useCallback,
} from 'react';

import { useTranslation } from 'next-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv3-client';
import { useCurrentUser } from '~/stores/context';
import { useSWRxIsQuestionnaireEnabled } from '~/stores/questionnaire';

const OtherSettings = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: currentUser, error: errorCurrentUser } = useCurrentUser();
  const { data: growiIsQuestionnaireEnabled } = useSWRxIsQuestionnaireEnabled();

  const [isQuestionnaireEnabled, setIsQuestionnaireEnabled] = useState(currentUser?.isQuestionnaireEnabled);

  const onChangeIsQuestionnaireEnabledHandler = useCallback(async() => {
    setIsQuestionnaireEnabled(prev => !prev);
  }, []);

  const onClickUpdateIsQuestionnaireEnabledHandler = useCallback(async() => {
    try {
      await apiv3Put('/personal-setting/questionnaire-settings', {
        isQuestionnaireEnabled,
      });
      toastSuccess(t('toaster.update_successed', { target: 'アンケート設定', ns: 'commons' }));
    }
    catch (err) {
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
      <h2 className="border-bottom my-4">{t('questionnaire.settings')}</h2>

      {isLoadingCurrentUser && <div className="text-muted text-center mb-5">
        <i className="fa fa-2x fa-spinner fa-pulse mr-1" />
      </div>}

      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">
          {!isLoadingCurrentUser && (
            <div className="custom-control custom-switch custom-checkbox-primary">
              <span id="personal-questionnaire-settings-toggle">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="isQuestionnaireEnabled"
                  checked={growiIsQuestionnaireEnabled && isQuestionnaireEnabled}
                  onChange={onChangeIsQuestionnaireEnabledHandler}
                  disabled={!growiIsQuestionnaireEnabled}
                />
                <label className="custom-control-label" htmlFor="isQuestionnaireEnabled">
                  {t('questionnaire.enable_questionnaire')}
                </label>
              </span>
              <p className="form-text text-muted small">
                {t('questionnaire.personal_settings_explanation')}
              </p>
              {!growiIsQuestionnaireEnabled && <UncontrolledTooltip placement="bottom" target="personal-questionnaire-settings-toggle">
                {t('questionnaire.disabled_by_admin')}
              </UncontrolledTooltip> }
            </div>
          )}
        </div>
      </div>

      <div className="row my-3">
        <div className="offset-4 col-5">
          <span className="d-inline-block" id="personal-questionnaire-settings-btn">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClickUpdateIsQuestionnaireEnabledHandler}
              disabled={!growiIsQuestionnaireEnabled}
              style={growiIsQuestionnaireEnabled ? {} : { pointerEvents: 'none' }}
            >
              {t('Update')}
            </button>
          </span>
          {!growiIsQuestionnaireEnabled && <UncontrolledTooltip placement="bottom" target="personal-questionnaire-settings-btn">
            {t('questionnaire.disabled_by_admin')}
          </UncontrolledTooltip>}
        </div>
      </div>
    </>
  );
};

export default OtherSettings;
