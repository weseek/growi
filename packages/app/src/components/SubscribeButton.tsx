import React, { FC, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '~/client/util/apiNotification';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

type Props = {
  appContainer: AppContainer,
  pageContainer: PageContainer,
  pageId: string,
};

const SubscribeButton: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const { appContainer, pageId } = props;
  const [isSubscribing, setIsSubscribing] = useState(false);

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

  return (
    <>
      <button
        type="button"
        id="subscribe-button"
        onClick={handleClick}
        className={`btn btn-subscribe border-0 ${isSubscribing ? 'active' : ''}  ${appContainer.isGuestUser ? 'disabled' : ''}`}
      >
        <i className={isSubscribing ? 'fa fa-eye' : 'fa fa-eye-slash'}></i>
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
