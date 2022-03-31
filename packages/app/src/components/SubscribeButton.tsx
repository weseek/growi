import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';
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

      {isGuestUser && (
        <UncontrolledTooltip placement="top" target="subscribe-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </>
  );

};

export default SubscribeButton;
