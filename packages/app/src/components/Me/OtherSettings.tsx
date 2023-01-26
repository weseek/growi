import {
  useState, useEffect, useCallback,
} from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv3-client';
import { useCurrentUser } from '~/stores/context';

const OtherSettings = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: currentUser, error: errorCurrentUser } = useCurrentUser();

  const [isEnableQuestionnaire, setIsEnableQuestionnaire] = useState(currentUser?.isEnableQuestionnaire);

  const onChangeIsEnableQuestionnaireHandler = useCallback(async() => {
    setIsEnableQuestionnaire(prev => !prev);
  }, []);

  const onClickUpdateIsEnableQuestionnaireHandler = useCallback(async() => {
    try {
      await apiv3Put('/personal-setting/questionnaire-settings', {
        isEnableQuestionnaire,
      });
      toastSuccess(t('toaster.update_successed', { target: 'アンケート設定', ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [isEnableQuestionnaire, t]);

  // Sync currentUser and state
  useEffect(() => {
    setIsEnableQuestionnaire(currentUser?.isEnableQuestionnaire);
  }, [currentUser?.isEnableQuestionnaire]);

  const isLoadingCurrentUser = currentUser === undefined && errorCurrentUser === undefined;

  return (
    <>
      <h2 className="border-bottom my-4">アンケート設定</h2>

      {isLoadingCurrentUser && <div className="text-muted text-center mb-5">
        <i className="fa fa-2x fa-spinner fa-pulse mr-1" />
      </div>}

      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">
          {!isLoadingCurrentUser && (
            <div className="custom-control custom-switch custom-checkbox-primary">
              <input
                type="checkbox"
                className="custom-control-input"
                id="isEnableQuestionnaire"
                checked={isEnableQuestionnaire}
                onChange={onChangeIsEnableQuestionnaireHandler}
              />
              <label className="custom-control-label" htmlFor="isEnableQuestionnaire">
                アンケートを有効にする
              </label>
              <p className="form-text text-muted small">
                GROWI 改善のためのアンケートが表示されるようになります。ご意見ご要望はユーザーアイコンのドロップダウンからお願いいたします。
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="row my-3">
        <div className="offset-4 col-5">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClickUpdateIsEnableQuestionnaireHandler}
          >
            {t('Update')}
          </button>
        </div>
      </div>
    </>
  );
};

export default OtherSettings;
