import React, { FC } from 'react';

import AppContainer from '~/client/services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

type Props = {
  appContainer: AppContainer,
};

const InAppNotificationSetting: FC<Props> = (props: Props) => {
  return (
    <>
      <p>InAppNotificationSetting</p>
    </>
  );
};

export const InAppNotificationSettingWrapper = withUnstatedContainers(InAppNotificationSetting, [AppContainer]);
