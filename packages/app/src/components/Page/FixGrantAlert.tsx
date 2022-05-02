import React from 'react';
import { useTranslation } from 'react-i18next';

const FixGrantAlert = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <div className="alert alert-warning py-3 pl-4 d-flex flex-column flex-lg-row">
        <div className="flex-grow-1">
          <i className="icon-fw icon-exclamation ml-1" aria-hidden="true" />
          {t('fix_grant_alert.description')}
        </div>
        <div className="d-flex align-items-end align-items-lg-center">
          <button className="btn btn-info btn-sm rounded-pill" onClick={() => alert('Show modal to fix')}>
            {t('fix_grant_alert.btn_label')}
          </button>
        </div>
      </div>
      {/* TODO: Render modal */}
    </>
  );
};

export default FixGrantAlert;
