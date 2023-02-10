import {
  useState, useCallback, useEffect,
} from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv3-client';
import { useSWRxAppSettings } from '~/stores/admin/app-settings';
import loggerFactory from '~/utils/logger';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:questionnaireSettings');

const QuestionnaireSettings = (): JSX.Element => {
  // TODO: i18n
  const { t } = useTranslation();

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
      toastSuccess(t('toaster.update_successed', { target: 'アンケート設定', ns: 'commons' }));
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
        システム全体でアンケート機能を有効/無効にします。また、ユーザーは設定画面から個別にアンケート機能を有効/無効にできます。
        <br />
        <br />
        <span>
          <span className="text-info mr-2"><i className="icon-info icon-fw"></i>送信されるデータについて</span>
          {/* eslint-disable-next-line max-len */}
          <a href="https://docs.growi.org/ja/admin-guide/management-cookbook/app-settings.html#%E3%82%A2%E3%83%B3%E3%82%B1%E3%83%BC%E3%83%88%E8%A8%AD%E5%AE%9A" rel="noreferrer" target="_blank" className="d-inline">詳細情報<i className="icon-share-alt"></i></a>
          <br />
          アンケートの回答と合わせて、GROWI の改善に必要な最小限の情報を合わせて収集します。<br />
          収集されるデータにユーザーの個人情報は含まれません。<br />
          私たちはそれらを活用し、最大限ユーザーの体験を向上させるよう努めます。
        </span>
      </p>

      {isLoading && <div className="text-muted text-center mb-5">
        <i className="fa fa-2x fa-spinner fa-pulse mr-1" />
      </div>}

      {!isLoading && (
        <>
          <div className="row my-3">
            <div className="custom-control custom-switch custom-checkbox-primary col-md-5 offset-md-5">
              <input
                type="checkbox"
                className="custom-control-input"
                id="isQuestionnaireEnabled"
                checked={isQuestionnaireEnabled}
                onChange={onChangeIsQuestionnaireEnabledHandler}
              />
              <label className="custom-control-label" htmlFor="isQuestionnaireEnabled">
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
                disabled={!isQuestionnaireEnabled}
              />
              <label className="custom-control-label" htmlFor="isAppSiteUrlHashed">
                サイト URL を匿名化して送信する
              </label>
              <p className="form-text text-muted small">
                アンケート回答データに含まれるサイト URL が匿名化されます。この設定を有効にすることで、アンケート回答データの送信元である GROWI アプリケーションが特定されなくなります。
              </p>
            </div>
          </div>

          <AdminUpdateButtonRow onClick={onSubmitHandler}/>
        </>
      )}
    </div>
  );
};

export default QuestionnaireSettings;
