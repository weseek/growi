import React, { FC, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:maintenanceMode');

type Props = {
  adminAppContainer: AdminAppContainer,
};

const MaintenanceMode: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { adminAppContainer } = props;

  const [isMaintenanceMode, setMaintenanceMode] = useState<boolean | undefined>(undefined);

  const onClickHandler = useCallback(async(e) => {
    try {
      if (isMaintenanceMode) {
        await adminAppContainer.endMaintenanceMode();
        setMaintenanceMode(false);
      }
      else {
        await adminAppContainer.startMaintenanceMode();
        setMaintenanceMode(true);
      }
    }
    catch (err) {
      toastError(isMaintenanceMode ? t('failed_to_end_maintenance_mode') : t('failed_to_start_maintenance_mode'));
    }

    toastSuccess(isMaintenanceMode ? t('successfully_ended_maintenance_mode') : t('successfully_started_maintenance_mode'));
  }, [isMaintenanceMode, adminAppContainer]);

  return (
    <>
      <p>
        description. description. description. description. description.
      </p>
      <div>
        <button type="button" onClick={onClickHandler}>
          {isMaintenanceMode ? t('end_maintenance_mode') : t('start_maintenance_mode')}
        </button>
      </div>
    </>
  );
};

export default withUnstatedContainers(MaintenanceMode, [AdminAppContainer]);
