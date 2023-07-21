import React, { FC, useCallback } from 'react';

import { SubscriptionStatusType } from '@growi/core/dist/interfaces';
import { useTranslation } from 'next-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import styles from './SubscribeButton.module.scss';


type Props = {
  isGuestUser?: boolean,
  status?: SubscriptionStatusType,
  onClick?: () => Promise<void>,
};

const SubscribeButton: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { isGuestUser, status } = props;

  const isSubscribing = status === SubscriptionStatusType.SUBSCRIBE;

  const getTooltipMessage = useCallback(() => {

    if (isSubscribing) {
      return 'tooltip.stop_notification';
    }
    return 'tooltip.receive_notifications';
  }, [isSubscribing]);

  return (
    <>
      <button
        type="button"
        id="subscribe-button"
        onClick={props.onClick}
        className={`shadow-none btn btn-subscribe ${styles['btn-subscribe']} border-0
          ${isSubscribing ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
      >
        <i className={`fa ${isSubscribing ? 'fa-bell' : 'fa-bell-slash-o'}`}></i>
      </button>

      <UncontrolledTooltip data-testid="subscribe-button-tooltip" placement="top" target="subscribe-button" fade={false}>
        {t(getTooltipMessage())}
      </UncontrolledTooltip>
    </>
  );

};

export default SubscribeButton;
