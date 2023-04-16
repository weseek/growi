import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess, toastError } from '~/client/util/toastr';
import { useIsMaintenanceMode } from '~/stores/maintenanceMode';
import loggerFactory from '~/utils/logger';

import { ConfirmModal } from './ConfirmModal';

const logger = loggerFactory('growi:maintenanceMode');


export const MaintenanceMode: FC = () => {
  const { t } = useTranslation();

  const {
    data: isMaintenanceMode, start: startMaintenanceMode, end: endMaintenanceMode,
  } = useIsMaintenanceMode();

  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const openModal = useCallback(() => { setModalOpen(true) }, []);

  const closeModal = useCallback(() => { setModalOpen(false) }, []);

  const onConfirmHandler = useCallback(async() => {
    closeModal();

    try {
      if (isMaintenanceMode) {
        endMaintenanceMode();
      }
      else {
        startMaintenanceMode();
      }
    }
    catch (err) {
      toastError(isMaintenanceMode ? t('admin:maintenance_mode.failed_to_end_maintenance_mode') : t('admin:maintenance_mode.failed_to_start_maintenance_mode'));
    }

    // eslint-disable-next-line max-len
    toastSuccess(isMaintenanceMode ? t('admin:maintenance_mode.successfully_ended_maintenance_mode') : t('admin:maintenance_mode.successfully_started_maintenance_mode'));
  }, [isMaintenanceMode, closeModal, startMaintenanceMode, endMaintenanceMode, t]);

  return (
    <div className="mb-5">
      <ConfirmModal
        isModalOpen={isModalOpen}
        warningMessage={isMaintenanceMode ? t('admin:maintenance_mode.warning_message_to_end') : t('admin:maintenance_mode.warning_message_to_start')}
        // eslint-disable-next-line max-len
        supplymentaryMessage={isMaintenanceMode ? null : t('admin:maintenance_mode.supplymentary_message_to_start')}
        confirmButtonTitle={isMaintenanceMode ? t('admin:maintenance_mode.end_maintenance_mode') : t('admin:maintenance_mode.start_maintenance_mode')}
        onConfirm={onConfirmHandler}
        onCancel={() => closeModal()}
      />
      <p className="card well">
        {t('admin:maintenance_mode.description')}
        <br />
        <br />
        <span className="text-warning">
          <i className="icon-exclamation icon-fw"></i>
          {t('admin:maintenance_mode.supplymentary_message_to_start')}
        </span>
      </p>
      <div className="row my-3">
        <div className="mx-auto">
          <button type="button" className="btn btn-success" onClick={() => openModal()}>
            {isMaintenanceMode ? t('admin:maintenance_mode.end_maintenance_mode') : t('admin:maintenance_mode.start_maintenance_mode')}
          </button>
        </div>
      </div>
    </div>
  );
};
