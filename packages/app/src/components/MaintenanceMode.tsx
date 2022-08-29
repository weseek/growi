import React, { FC } from 'react';
import { useTranslation } from 'next-i18next';

import { MaintenanceModeContent } from '../components/MaintenanceModeContent';

export const MaintenanceMode: FC = () => {
  const { t } = useTranslation();

  return (
    <div id="content-main" className="content-main container-lg">
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col-md-6 mt-5">
            <div className="text-center">
              <h1><i className="icon-exclamation large"></i></h1>
              <h1 className="text-center">{ t('maintenance_mode.maintenance_mode') }</h1>
              <h3>{ t('maintenance_mode.growi_is_under_maintenance') }</h3>
              <hr />
              <MaintenanceModeContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};
