import React, {
  FC, useState, useCallback, useEffect,
} from 'react';

import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '~/client/util/apiNotification';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

type Props = {
  appContainer: AppContainer,
  pageId: string,
};

const SubscribeButton: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const { appContainer, pageId } = props;
  const [isSubscribing, setIsSubscribing] = useState<boolean | null>(null);

  const active = isSubscribing ? 'active' : '';
  const disabled = appContainer.isGuestUser ? 'disabled' : '';
  const eyeOpen = isSubscribing || isSubscribing == null ? 'fa fa-eye' : 'fa fa-eye-slash';

  const handleClick = async() => {
    if (appContainer.isGuestUser) {
      return;
    }

    try {
      const res = await appContainer.apiv3Put('page/subscribe', { pageId, status: !isSubscribing });
      if (res) {
        const { subscription } = res.data;
        setIsSubscribing(subscription.status === 'SUBSCRIBE');
      }
    }
    catch (err) {
      toastError(err);
    }
  };

  const fetchSubscriptionStatus = useCallback(async() => {
    if (appContainer.isGuestUser) {
      return;
    }

    try {
      const res = await appContainer.apiv3Get('page/subscribe', { pageId });
      const { subscribing } = res.data;
      if (subscribing == null) {
        setIsSubscribing(null);
      }
      else {
        setIsSubscribing(subscribing);
      }
    }
    catch (err) {
      toastError(err);
    }
  }, [appContainer, pageId]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  return (
    <>
      <button
        type="button"
        id="subscribe-button"
        onClick={handleClick}
        className={`btn btn-subscribe border-0 ${active} ${disabled}`}
      >
        <i className={eyeOpen}></i>
      </button>

      {appContainer.isGuestUser && (
        <UncontrolledTooltip placement="top" target="subscribe-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const SubscribeButtonWrapper = withUnstatedContainers(SubscribeButton, [AppContainer, PageContainer]);
export default SubscribeButtonWrapper;
