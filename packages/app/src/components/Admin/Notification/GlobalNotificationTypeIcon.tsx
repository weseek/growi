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
  const type = (__t != null && __t === 'mail') ? 'mail' : 'slack';

  const elemId = `notification-${type}-${_id}`;

  return (
    <>
      { type === 'mail' ? (
        <><i id={elemId} className='icon-fw fa fa-envelope-o'></i><UncontrolledTooltip target={elemId}>Mail</UncontrolledTooltip></>
      ) : (
        <><i id={elemId} className='icon-fw fa fa-hashtag'></i><UncontrolledTooltip target={elemId}>Slack</UncontrolledTooltip></>
      ) }
    </>
  );
};
