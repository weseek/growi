import React, { FC, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import { SubscriptionStatusType } from '~/interfaces/subscription';


type Props = {
  isGuestUser?: boolean,
  status?: SubscriptionStatusType,
  onClick?: () => Promise<void>,
};

const SubscribeButton: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { isGuestUser, status } = props;

  const isSubscribing = status === SubscriptionStatusType.SUBSCRIBE;

  const buttonClass = `${isSubscribing ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`;
  const iconClass = isSubscribing === false ? 'fa fa-eye-slash' : 'fa fa-eye';

  const getTooltipMessage = useCallback(() => {
    if (isGuestUser) {
      return 'Not available for guest';
    }

    if (isSubscribing) {
      return 'tooltip.stop_notification';
    }
    return 'tooltip.receive_notifications';
  }, [isGuestUser, isSubscribing]);

  return (
    <>
      <button
        type="button"
        id="subscribe-button"
        onClick={props.onClick}
        className={`btn btn-subscribe border-0 ${buttonClass}`}
      >
        <i className={iconClass}></i>
      </button>

      <UncontrolledTooltip placement="top" target="subscribe-button" fade={false}>
        {t(getTooltipMessage())}
      </UncontrolledTooltip>
    </>
  );

};

export default SubscribeButton;
