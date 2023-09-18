import { FC, useCallback } from 'react';

import { apiv3Put } from '~/client/util/apiv3-client';

import { KeycloakGroupSyncSettingsForm } from './KeycloakGroupSyncSettingsForm';
import { SyncExecution } from './SyncExecution';

export const KeycloakGroupManagement: FC = () => {

  const requestSyncAPI = useCallback(async() => {
    await apiv3Put('/external-user-groups/keycloak/sync');
  }, []);

  return (
    <>
      <KeycloakGroupSyncSettingsForm />
      <SyncExecution requestSyncAPI={requestSyncAPI} />
    </>
  );
};
