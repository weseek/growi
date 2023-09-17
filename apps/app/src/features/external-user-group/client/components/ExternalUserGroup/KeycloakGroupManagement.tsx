import {
  FC, useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'react-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import LabeledProgressBar from '~/components/Admin/Common/LabeledProgressBar';
import { SocketEventName } from '~/interfaces/websocket';
import { useAdminSocket } from '~/stores/socket-io';

import { useSWRxExternalUserGroupList } from '../../stores/external-user-group';

import { KeycloakGroupSyncSettingsForm } from './KeycloakGroupSyncSettingsForm';

export const KeycloakGroupManagement: FC = () => {
  const { t } = useTranslation('admin');
  const { data: socket } = useAdminSocket();
  const { mutate: mutateExternalUserGroups } = useSWRxExternalUserGroupList();

  const [syncStatus, setSyncStatus] = useState<'beforeSync' | 'syncExecuting' | 'syncFinished'>('beforeSync');
  const [progress, setProgress] = useState({
    total: 0,
    current: 0,
  });

  useEffect(() => {
    if (socket != null) {
      socket.on(SocketEventName.GroupSyncProgress, (data) => {
        setSyncStatus('syncExecuting');
        setProgress({
          total: data.totalCount,
          current: data.count,
        });
      });

      socket.on(SocketEventName.FinishGroupSync, () => {
        setSyncStatus('syncFinished');
      });
    }
  }, [socket]);

  const onSyncBtnClick = useCallback(async(e) => {
    e.preventDefault();
    setProgress({ total: 0, current: 0 });
    setSyncStatus('syncExecuting');
    try {
      await apiv3Put('/external-user-groups/keycloak/sync');
      toastSuccess(t('external_user_group.sync_succeeded'));
      mutateExternalUserGroups();
    }
    catch (errs) {
      toastError(t(errs[0]?.code));
    }
  }, [t, mutateExternalUserGroups]);

  const renderProgressBar = () => {
    if (syncStatus === 'beforeSync') return null;

    const header = syncStatus === 'syncExecuting' ? 'Processing..' : 'Completed';

    return (
      <LabeledProgressBar
        header={header}
        currentCount={progress.current}
        totalCount={progress.total}
      />
    );
  };

  return (
    <>
      <KeycloakGroupSyncSettingsForm />
      <h3 className="border-bottom mb-3">{t('external_user_group.execute_sync')}</h3>
      <div className="row">
        <div className="col-md-3"></div>
        <div className="col-md-9">
          {renderProgressBar()}
        </div>
      </div>
      <form onSubmit={onSyncBtnClick}>
        <div className="row">
          <div className="col-md-3"></div>
          <div className="col-md-6"><button className="btn btn-primary" type="submit">{t('external_user_group.sync')}</button></div>
        </div>
      </form>
    </>
  );
};
