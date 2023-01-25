import {
  useState, useCallback,
} from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
import loggerFactory from '~/utils/logger';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:questionnaireSettings');

const QuestionnaireSettings = (): JSX.Element => {
  const { t } = useTranslation();

  // TODO: swrx
  const { data, mutate } = {
    data: {
      isEnableQuestionnaire: true,
      isAppSiteUrlHashed: false,
    },
    mutate: () => {},
  };

  const [isEnableQuestionnaire, setIsEnableQuestionnaire] = useState(data.isEnableQuestionnaire);
  const onChangeIsEnableQuestionnaireHandler = useCallback(() => {
    setIsEnableQuestionnaire(prev => !prev);
  }, []);

  const [isAppSiteUrlHashed, setIsAppSiteUrlHashed] = useState(data.isAppSiteUrlHashed);
  const onChangeisAppSiteUrlHashedHandler = useCallback(() => {
    setIsAppSiteUrlHashed(prev => !prev);
  }, []);

  const onSubmitHandler = useCallback(async() => {
    try {
      await apiv3Post('/admin/questionnaire-settings', {
        isEnableQuestionnaire,
        isAppSiteUrlHashed,
      });
      toastSuccess('送信完了！');
    }
    catch {
      toastError('送信失敗...');
    }
  }, [isAppSiteUrlHashed, isEnableQuestionnaire]);

  return (
    <div className="mb-5">
      <p className="card well">
        送信されるデータにユーザーの個人情報は一切含まれません。
        <br />
        ユーザー設定画面から個別にアンケート機能を有効無効に設定できます。
        <br />
        <br />
        GROWI の改善にご協力お願いします。
      </p>

      <div className="row my-3">
        <div className="custom-control custom-switch custom-checkbox-primary col-md-5 offset-md-5">
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
        </div>
      </div>

      <div className="row my-4">
        <div className="custom-control custom-checkbox custom-checkbox-primary col-md-5 offset-md-5">
          <input
            type="checkbox"
            className="custom-control-input"
            id="isAppSiteUrlHashed"
            checked={isAppSiteUrlHashed}
            onChange={onChangeisAppSiteUrlHashedHandler}
            disabled={!isEnableQuestionnaire}
          />
          <label className="custom-control-label" htmlFor="isAppSiteUrlHashed">
            アプリ URL を暗号化して送信する
          </label>
        </div>
      </div>

      <AdminUpdateButtonRow onClick={onSubmitHandler}/>
    </div>
  );
};

export default QuestionnaireSettings;
