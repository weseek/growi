import React, { useState, FC } from 'react';

import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '~/client/util/apiNotification';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

type Props = {
  appContainer: AppContainer,
  pageContainer: PageContainer,
};

const SubscruibeButton: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const { appContainer, pageContainer } = props;
  const [isWatching, setIsWatching] = useState(false);

  const handleClick = async() => {
    try {
      const res = await appContainer.apiv3Put('page/subscribe', { pageId: pageContainer.state.pageId, status: !isWatching });
      if (res) {
        const { subscription } = res.data;
        setIsWatching(subscription.status === 'WATCH');
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
        className={`btn btn-watch border-0 ${isWatching ? 'active' : ''}  ${appContainer.isGuestUser ? 'disabled' : ''}`}
      >
        {isWatching && (
          <i className="fa fa-eye"></i>
        )}

        {!isWatching && (
          <i className="fa fa-eye-slash"></i>
        )}
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
const SubscruibeButtonWrapper = withUnstatedContainers(SubscruibeButton, [AppContainer, PageContainer]);
export default SubscruibeButtonWrapper;
