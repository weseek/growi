import React from 'react';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';

const SlackIcon = (props) => {
  const { __t, _id, provider } = props.notification;

  let type = 'slack';

  // User trigger notification
  if (provider != null) {
    // only slack type
  }

  // Global notification
  if (__t != null) {
    if (__t === 'mail') {
      type = 'mail';
    }
  }

  const elemId = `notification-${type}-${_id}`;
  const className = type === 'mail'
    ? 'icon-fw fa fa-envelope-o'
    : 'icon-fw fa fa-hashtag';

  return (
    <>
      <i id={elemId} className={className}></i>
      <UncontrolledTooltip target={elemId}>Slack</UncontrolledTooltip>
    </>
  );
};

SlackIcon.propTypes = {
  // supports 2 types:
  //   User trigger notification -> has 'provider: slack'
  //   Global notification -> has '__t: slack|mail'
  notification: PropTypes.object.isRequired,
};

export default SlackIcon;
