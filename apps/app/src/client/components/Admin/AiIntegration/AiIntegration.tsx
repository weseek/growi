import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';


export const AiIntegration = (): JSX.Element => {
  const { t } = useTranslation('admin');

  const clickRebuildVectorStoreButtonHandler = useCallback(async() => {
    try {
      await apiv3Put('/ai-integration/rebuild-vector-store');
      toastSuccess(t('ai_integration.rebuild_vector_store_succeeded'));
    }
    catch {
      toastError(t('ai_integration.rebuild_vector_store_failed'));
    }
  }, [t]);

  return (
    <div data-testid="admin-ai-integration">
      <h2 className="mb-4"> { t('ai_integration.ai_integration') } </h2>

      <h3>{ t('ai_integration.ai_search_management') }</h3>

      <div className="row">
        <label className="col-md-3 col-form-label text-start text-md-end">{ t('ai_integration.rebuild_vector_store_label') }</label>
        <div className="col-md-8">
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
