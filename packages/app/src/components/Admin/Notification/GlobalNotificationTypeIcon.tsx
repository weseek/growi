import React from 'react';

import { UncontrolledTooltip } from 'reactstrap';

import type { IGlobalNotificationType } from '~/client/interfaces/global-notification';


type GlobalNotificationTypeIconProps = {
  // supports 2 types:
  //   User trigger notification -> has 'provider: slack'
  //   Global notification -> has '__t: slack|mail'
  notification: IGlobalNotificationType
}

export const GlobalNotificationTypeIcon = (props: GlobalNotificationTypeIconProps): JSX.Element => {
  const { __t, _id, provider } = props.notification;

  // User trigger notification
  if (provider != null) {
    // only slack type
  }

  // Global notification
  const elemId = `notification-${__t}-${_id}`;
  const className = __t === 'mail' ? 'icon-fw fa fa-envelope-o' : 'icon-fw fa fa-hashtag';
  const toolChip = __t === 'mail' ? 'Mail' : 'Slack';

  return <><i id={elemId} className={className}></i><UncontrolledTooltip target={elemId}>{toolChip}</UncontrolledTooltip></>;
};
