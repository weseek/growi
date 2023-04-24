import React from 'react';

import { UncontrolledTooltip } from 'reactstrap';

import type { INotificationType } from '~/client/interfaces/notification';


type NotificationTypeIconProps = {
  // supports 2 types:
  //   User trigger notification -> has 'provider: slack'
  //   Global notification -> has '__t: slack|mail'
  notification: INotificationType
}

export const NotificationTypeIcon = (props: NotificationTypeIconProps): JSX.Element => {
  const { __t, _id, provider } = props.notification;

  const type = __t != null && __t === 'mail' ? 'mail' : 'slack';

  // User trigger notification
  if (provider != null) {
    // only slack type
  }

  const elemId = `notification-${type}-${_id}`;
  const className = type === 'mail' ? 'icon-fw fa fa-envelope-o' : 'icon-fw fa fa-hashtag';
  const toolChip = type === 'mail' ? 'Mail' : 'Slack';

  return <><i id={elemId} className={className}></i><UncontrolledTooltip target={elemId}>{toolChip}</UncontrolledTooltip></>;
};
