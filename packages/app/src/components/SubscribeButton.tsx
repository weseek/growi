import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';
import { useSWRxSubscriptionStatus } from '../stores/page';


import { toastError } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv3-client';
import { useIsGuestUser } from '~/stores/context';

type Props = {
  pageId: string,
};

const SubscribeButton: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { pageId } = props;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: subscriptionData, mutate } = useSWRxSubscriptionStatus(pageId);

  let isSubscribed;

  switch (subscriptionData?.status) {
    case true:
      isSubscribed = true;
      break;
    case false:
      isSubscribed = false;
      break;
    default:
      isSubscribed = null;
  }

  const buttonClass = `${isSubscribed ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`;
  const iconClass = isSubscribed || isSubscribed == null ? 'fa fa-eye' : 'fa fa-eye-slash';

  const handleClick = async() => {
    if (isGuestUser) {
      return;
    }

    try {
      const res = await apiv3Put('/page/subscribe', { pageId, status: !isSubscribed });
      if (res) {
        mutate();
      }
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <button
        type="button"
        id="subscribe-button"
        onClick={handleClick}
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
