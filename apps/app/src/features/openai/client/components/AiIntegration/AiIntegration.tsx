import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';


export const AiIntegration = (): JSX.Element => {
  const { t } = useTranslation('admin');

  const clickRebuildVectorStoreButtonHandler = useCallback(async() => {
    try {
      toastSuccess(t('ai_integration.rebuild_vector_store_requested'));
      await apiv3Post('/openai/rebuild-vector-store');
    }
    catch {
      toastError(t('ai_integration.rebuild_vector_store_failed'));
    }
  }, [t]);

  return (
    <div data-testid="admin-ai-integration">
      <h2 className="admin-setting-header">{ t('ai_integration.ai_search_management') }</h2>

      <div className="row">
        <label className="col-md-3 col-form-label text-start text-md-end">{ t('ai_integration.rebuild_vector_store_label') }</label>
        <div className="col-md-8">
          {/* TODO: https://redmine.weseek.co.jp/issues/153978 */}
          <button
            type="submit"
            className="btn btn-primary"
            onClick={clickRebuildVectorStoreButtonHandler}
          >
            {t('ai_integration.rebuild_vector_store')}
          </button>

          <p className="form-text text-muted">
            {t('ai_integration.rebuild_vector_store_explanation1')}<br />
            {t('ai_integration.rebuild_vector_store_explanation2')}<br />
          </p>
        </div>
      </div>
    </div>
  );
};
