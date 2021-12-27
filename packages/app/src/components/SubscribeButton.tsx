import React, { FC } from 'react';


import { Types } from 'mongoose';
import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';
import { withUnstatedContainers } from './UnstatedUtils';
import { useSWRxSubscribeButton } from '../stores/page';


import { toastError } from '~/client/util/apiNotification';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

type Props = {
  appContainer: AppContainer,
  pageId: Types.ObjectId,
};

const SubscribeButton: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { appContainer, pageId } = props;
  const { data: subscriptionData, mutate } = useSWRxSubscribeButton(pageId);

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

  const buttonClass = `${isSubscribed ? 'active' : ''} ${appContainer.isGuestUser ? 'disabled' : ''}`;
  const iconClass = isSubscribed || isSubscribed == null ? 'fa fa-eye' : 'fa fa-eye-slash';

  const handleClick = async() => {
    if (appContainer.isGuestUser) {
      return;
    }

    try {
      const res = await appContainer.apiv3Put('page/subscribe', { pageId, status: !isSubscribed });
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
