import {
  FC, useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'react-i18next';

import { toastError, toastSuccess } from '~/client/util/toastr';
import LabeledProgressBar from '~/components/Admin/Common/LabeledProgressBar';
import { ExternalGroupProviderType } from '~/features/external-user-group/interfaces/external-user-group';
import { SocketEventName } from '~/interfaces/websocket';
import { useAdminSocket } from '~/stores/socket-io';

import { useSWRxExternalUserGroupList } from '../../stores/external-user-group';

type SyncExecutionProps = {
  provider: ExternalGroupProviderType
  requestSyncAPI: (e) => Promise<void>
  AdditionalForm?: FC
}

enum SyncStatus {
  beforeSync,
  syncExecuting,
  syncCompleted,
  syncFailed,
}

export const SyncExecution = ({
  provider,
  requestSyncAPI,
  AdditionalForm = () => <></>,
}: SyncExecutionProps): JSX.Element => {
  const { t } = useTranslation('admin');
  const { data: socket } = useAdminSocket();
  const { mutate: mutateExternalUserGroups } = useSWRxExternalUserGroupList();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.beforeSync);
  const [progress, setProgress] = useState({
    total: 0,
    current: 0,
  });

  useEffect(() => {
    if (socket == null) return;

    const eventName = SocketEventName.externalUserGroup[provider];

    socket.on(eventName.GroupSyncProgress, (data) => {
      setSyncStatus(SyncStatus.syncExecuting);
      setProgress({
        total: data.totalCount,
        current: data.count,
      });
    });

    socket.on(eventName.GroupSyncCompleted, () => {
      setSyncStatus(SyncStatus.syncCompleted);
      mutateExternalUserGroups();
      toastSuccess(t('external_user_group.sync_succeeded'));
    });

    socket.on(eventName.GroupSyncFailed, () => {
      setSyncStatus(SyncStatus.syncFailed);
      mutateExternalUserGroups();
      toastError(t('external_user_group.sync_failed'));
    });

    return () => {
      socket.off(eventName.GroupSyncProgress);
      socket.off(eventName.GroupSyncCompleted);
      socket.off(eventName.GroupSyncFailed);
    };
  }, [socket, mutateExternalUserGroups, t, provider]);

  const onSyncBtnClick = useCallback(async(e) => {
    e.preventDefault();
    try {
      // set sync status before requesting to API, so that setting to syncFailed does not get overwritten
      setSyncStatus(SyncStatus.syncExecuting);
      setProgress({ total: 0, current: 0 });
      await requestSyncAPI(e);
    }
    catch (errs) {
      setSyncStatus(SyncStatus.syncFailed);
      toastError(t(errs[0]?.code));
    }
  }, [t, requestSyncAPI]);

  const renderProgressBar = () => {
    if (syncStatus === SyncStatus.beforeSync) return null;

    let header;
    if (syncStatus === SyncStatus.syncExecuting) {
      header = 'Processing..';
    }
    else if (syncStatus === SyncStatus.syncCompleted) {
      header = 'Completed';
    }
    else {
      header = 'Failed';
    }

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
      <h3 className="border-bottom mb-3">{t('external_user_group.execute_sync')}</h3>
      <div className="row">
        <div className="col-md-3"></div>
        <div className="col-md-9">
          {renderProgressBar()}
        </div>
      </div>
      <form onSubmit={onSyncBtnClick}>
        <AdditionalForm />
        <div className="row">
          <div className="col-md-3"></div>
          <div className="col-md-6"><button className="btn btn-primary" type="submit">{t('external_user_group.sync')}</button></div>
        </div>
      </form>
    </>
  );
};
