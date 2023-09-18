import {
  FC, useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'react-i18next';

import { toastError, toastSuccess } from '~/client/util/toastr';
import LabeledProgressBar from '~/components/Admin/Common/LabeledProgressBar';
import { SocketEventName } from '~/interfaces/websocket';
import { useAdminSocket } from '~/stores/socket-io';

import { useSWRxExternalUserGroupList } from '../../stores/external-user-group';

type SyncExecutionProps = {
  requestSyncAPI: (e) => Promise<void>
  AdditionalForm?: FC
}

export const SyncExecution = ({
  requestSyncAPI,
  AdditionalForm = () => <></>,
}: SyncExecutionProps): JSX.Element => {
  const { t } = useTranslation('admin');
  const { data: socket } = useAdminSocket();
  const { mutate: mutateExternalUserGroups } = useSWRxExternalUserGroupList();
  const [syncStatus, setSyncStatus] = useState<'beforeSync' | 'syncExecuting' | 'syncCompleted' | 'syncFailed'>('beforeSync');
  const [progress, setProgress] = useState({
    total: 0,
    current: 0,
  });

  useEffect(() => {
    if (socket != null) {
      socket.off(SocketEventName.GroupSyncProgress);
      socket.on(SocketEventName.GroupSyncProgress, (data) => {
        setSyncStatus('syncExecuting');
        setProgress({
          total: data.totalCount,
          current: data.count,
        });
      });

      socket.off(SocketEventName.GroupSyncCompleted);
      socket.on(SocketEventName.GroupSyncCompleted, () => {
        setSyncStatus('syncCompleted');
        mutateExternalUserGroups();
        toastSuccess(t('external_user_group.sync_succeeded'));
      });

      socket.off(SocketEventName.GroupSyncFailed);
      socket.on(SocketEventName.GroupSyncFailed, () => {
        setSyncStatus('syncFailed');
        mutateExternalUserGroups();
        toastError(t('external_user_group.sync_failed'));
      });
    }
  }, [socket, mutateExternalUserGroups, t]);

  const onSyncBtnClick = useCallback(async(e) => {
    e.preventDefault();
    try {
      await requestSyncAPI(e);
      setProgress({ total: 0, current: 0 });
      setSyncStatus('syncExecuting');
    }
    catch (errs) {
      toastError(t(errs[0]?.code));
    }
  }, [t, requestSyncAPI]);

  const renderProgressBar = () => {
    if (syncStatus === 'beforeSync') return null;

    let header;
    if (syncStatus === 'syncExecuting') {
      header = 'Processing..';
    }
    else if (syncStatus === 'syncCompleted') {
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
